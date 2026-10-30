"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Minus,
  Plus,
  Star,
  ChevronDown,
  Truck,
  X,
  Check,
  Phone,
  Banknote,
  PackageOpen,
  Ruler,
  AlertCircle,
} from "lucide-react";

import { FB_EVENTS, trackFacebookEvent } from "@/lib/facebook";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { api, getImageUrl } from "@/lib/api";
import { withRetry } from "@/lib/retry";
import { Product, Review } from "@/types/api";

import placeholderImage from "../../../public/assets/placeholder-image.svg";
import Image from "next/image";

import { Montserrat } from "next/font/google";
import PdpGallery from "./PdpGallery";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300"],
  // Used by .pdp-logo in pdp.css, which outranks the page-wide font rules.
  variable: "--font-lt-logo",
});

const formatDZD = (amount: number) =>
  `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0")}\u00a0د.ج`;

// A backend delivery price is usable when it is a finite number ≥ 0; 0 means free delivery.
const isValidPrice = (p: number | null | undefined): p is number =>
  typeof p === "number" && Number.isFinite(p) && p >= 0;
const formatShipping = (p: number) => (p === 0 ? "مجاني" : formatDZD(p));

// ─── Wilayas and delivery prices (getCountries) ───────────────────────────────
// Keeps backend values as they are: a price that is not a finite number becomes null
// (that delivery method is then disabled); it is never replaced by 0.
const toPrice = (p: unknown): number | null => (typeof p === "number" && Number.isFinite(p) ? p : null);

function parseCountries(json: unknown): Country[] {
  const data = (json as { data?: unknown } | null)?.data;
  if (!Array.isArray(data)) throw new Error("Unexpected getCountries response");
  const countries = data
    .filter((c): c is Country => !!c && typeof c.id === "number" && typeof c.nameAr === "string")
    .map((c) => ({ ...c, price1: toPrice(c.price1), price2: toPrice(c.price2) }));
  if (countries.length === 0) throw new Error("getCountries returned no wilayas");
  return countries;
}

// 10 s per attempt, retried after 1 s and 3 s.
const loadCountries = () =>
  withRetry(async () => {
    const res = await fetch("https://back.testwebapp.space/getCountries", { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`getCountries HTTP ${res.status}`);
    return parseCountries(await res.json());
  });

// ─── Types ────────────────────────────────────────────────────────────────────
interface Commune {
  id: number;
  nameFr: string;
  nameAr: string;
}

interface Country {
  id: number;
  nameFr: string;
  nameAr: string;
  price1: number | null;
  price2: number | null;
  communes: string | Commune[];
}

interface OtherInfoItem {
  question: string;
  answer: string;
}

interface ColorImage {
  color: number;
  imageIndex: number;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
// ─── Full name → backend name / surName ──────────────────────────────────────
// One «الاسم واللقب» field; the backend keeps two columns. Rule (consistent and lossless):
//   1. Trim and collapse spaces; at least two words are required.
//   2. name = the first word, surName = every remaining word, in order.
//   3. Exception: a first word of «عبد», «أبو» or «ابو» followed by at least two more words
//      forms a compound first name with the next word («عبد الرحمن بن يوسف» → «عبد الرحمن» / «بن يوسف»).
// `${name} ${surName}` always equals the normalized full name, so no part is lost. Other compound
// first names («فاطمة الزهراء بن علي») cannot be told apart from surnames and follow rule 2.
const nameWords = (v: string) => v.trim().split(/\s+/).filter(Boolean);
const COMPOUND_PREFIXES = ["عبد", "أبو", "ابو"];
function splitFullName(full: string): { name: string; surName: string } {
  const words = nameWords(full);
  const firstLen = words.length >= 3 && COMPOUND_PREFIXES.includes(words[0]) ? 2 : 1;
  return {
    name: words.slice(0, firstLen).join(" "),
    surName: words.slice(firstLen).join(" ") || " ",
  };
}

// Algerian numbers: mobile 05/06/07 + 8 digits, landline 02–04 + 7 digits, with 0, +213 or 00213.
// Checked on a normalized copy only (Arabic digits, spaces and dashes allowed); the number is sent as typed.
const normalizePhone = (v: string) =>
  v
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s\-.()]/g, "");
const DZ_PHONE = /^(?:\+213|00213|0)(?:[5-7]\d{8}|[2-4]\d{7})$/;

const formSchema = z
  .object({
    fullName: z
      .string()
      .refine((v) => v.trim().length > 0, "اكتبي الاسم واللقب")
      .refine((v) => !v.trim() || nameWords(v).length >= 2, "اكتبي الاسم واللقب معًا، مثال: أمينة بن علي"),
    phone: z
      .string()
      .refine((v) => v.trim().length > 0, "رقم الهاتف مطلوب")
      .refine((v) => !v.trim() || DZ_PHONE.test(normalizePhone(v)), "رقم الهاتف غير صحيح. مثال: 0555 12 34 56"),
    size: z.string().min(1, "المقاس مطلوب"),
    color: z.string().optional(),
    // A disabled select (wilayas still loading or unavailable) reports undefined, hence `error`.
    country: z.string({ error: "اختاري الولاية" }).min(1, "اختاري الولاية"),
    commune: z.string().optional(),
    shippingType: z.enum(["domicile", "bureau"]).optional(),
    // Set by the form, never sent: does the chosen wilaya list communes, and does the chosen
    // delivery method have a valid backend price?
    communeRequired: z.boolean().optional(),
    shippingAvailable: z.boolean().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.communeRequired && !d.commune) {
      ctx.addIssue({ code: "custom", path: ["commune"], message: "اختاري البلدية" });
    }
    if (d.country && d.shippingAvailable === false) {
      ctx.addIssue({ code: "custom", path: ["shippingType"], message: "طريقة التوصيل هذه غير متوفرة لهذه الولاية." });
    }
  });

type FormValues = z.infer<typeof formSchema>;

// ─── Luxury Logo ──────────────────────────────────────────────────────────────
function LuxuryLogo() {
  return (
    <div
      className={`${montserrat.className} ${montserrat.variable} pdp-logo flex flex-col items-center justify-center select-none leading-none`}
      dir="ltr"
    >
      <p className="whitespace-nowrap text-[18px] font-extralight uppercase tracking-[7px] text-[#302B27] sm:text-[22px] sm:tracking-[10px]">
        LABELTEXTILE
      </p>
      <div className="mt-2.5 flex items-center justify-center gap-3">
        <div className="h-px w-8 bg-[#A78D77]/60" />
        <span className="text-[11px] font-light uppercase tracking-[5px] text-[#625850]">ALGÉRIE</span>
        <div className="h-px w-8 bg-[#A78D77]/60" />
      </div>
    </div>
  );
}

// ─── Thank You Modal ──────────────────────────────────────────────────────────
// Shown after addOrder succeeds (same trigger as before). Close, backdrop tap, Esc and
// «مواصلة التسوق» all call onClose, as the previous modal did.
const SUCCESS_INFO = [
  { Icon: Phone, title: "الخطوة الجاية: تأكيد الطلب", text: "خلي هاتفك متاح باش نقدروا نتواصلوا معاك." },
  { Icon: PackageOpen, title: "افتحي كولي قبل ما تخلصي", text: "تقدري تتأكدي من المنتج قبل الدفع." },
];

function ThankYouModal({ onClose }: { onClose: () => void }) {
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    ctaRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Esc closes, like the backdrop and the close button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#E8E1D9]/85 px-3.5 py-4 backdrop-blur-[3px] animate-in fade-in duration-300 sm:px-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-success-title"
        aria-describedby="order-success-desc"
        dir="rtl"
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[520px] flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_18px_50px_-20px_rgba(48,43,39,0.35)] animate-in zoom-in-95 duration-300"
      >
        {/* Header: logo, close (upper right), thin divider */}
        <div className="relative shrink-0 border-b border-[#E8E1D9] px-14 pt-6 pb-5">
          <LuxuryLogo />
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-1/2 right-2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-[#625850] transition-colors hover:bg-[#FAF9F6] hover:text-[#302B27] focus-visible:outline-2 focus-visible:outline-[#302B27]"
          >
            <X size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        {/* Body scrolls inside the card on short screens; nothing is clipped. */}
        <div className="flex flex-col items-center overflow-y-auto overscroll-contain px-5 pt-6 pb-5 text-center sm:px-8 sm:pt-7">
          <div className="flex size-[60px] shrink-0 items-center justify-center rounded-full bg-[#F3EDE6]">
            <Check size={26} strokeWidth={1.75} className="text-[#A78D77]" aria-hidden />
          </div>

          <h2 id="order-success-title" className="mt-4 text-[25px] font-bold leading-[1.5] text-[#302B27] sm:text-[26px]">
            طلبك تسجّل بنجاح!
          </h2>
          <p className="mt-1 text-[16px] font-medium leading-[1.7] text-[#625850]">شكرًا على ثقتك فينا ♡</p>
          <p id="order-success-desc" className="mt-2 text-[16px] leading-[1.75] text-[#51463F]">
            راح نتواصلوا معاك قريبًا باش نأكدوا تفاصيل طلبك قبل الشحن.
          </p>

          <ul className="mt-5 w-full divide-y divide-[#E8E1D9] rounded-[6px] border border-[#E8E1D9] bg-[#FAF9F6] px-4 text-right">
            {SUCCESS_INFO.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3 py-3.5">
                <Icon size={22} strokeWidth={1.6} className="mt-1 shrink-0 text-[#A78D77]" aria-hidden />
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold leading-[1.6] text-[#302B27]">{title}</p>
                  <p className="mt-0.5 text-[15px] leading-[1.65] text-[#625850]">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <button
            ref={ctaRef}
            type="button"
            onClick={onClose}
            className="mt-5 flex h-[52px] w-full shrink-0 items-center justify-center rounded-[6px] bg-[#302B27] text-[17px] font-semibold text-white transition-colors hover:bg-[#302B27]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#302B27]"
          >
            مواصلة التسوق
          </button>

          <p className="mt-3.5 text-[13.5px] leading-[1.6] text-[#625850]">الدفع عند الاستلام · التوصيل إلى كل الولايات</p>
        </div>
      </div>
    </div>
  );
}


// ─── Order summary ────────────────────────────────────────────────────────────
// Display only: products + delivery for the chosen method, the same amounts the order sends.
function OrderSummary({
  title,
  size,
  quantity,
  subtotal,
  shippingPrice,
  shippingLabel,
}: {
  title: string;
  size: string;
  quantity: number;
  subtotal: number;
  shippingPrice: number | null;
  shippingLabel: string | null;
}) {
  const total = shippingPrice !== null ? subtotal + shippingPrice : null;
  return (
    <dl className="space-y-2.5 rounded-[6px] bg-lt-sand/70 p-4 text-[15px] leading-[1.6]">
      <div className="flex justify-between gap-4">
        <dt className="min-w-0">
          المنتج
          <span className="block truncate text-[13.5px] text-lt-desc">
            {title} · {size} × {quantity}
          </span>
        </dt>
        <dd className="shrink-0 tabular-nums">{formatDZD(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="min-w-0">
          التوصيل
          {shippingLabel && <span className="block text-[13.5px] text-lt-desc">{shippingLabel}</span>}
        </dt>
        <dd className={`shrink-0 tabular-nums ${shippingPrice === null ? "text-[13.5px] text-lt-desc" : ""}`}>
          {shippingPrice === null ? "اختاري الولاية" : formatShipping(shippingPrice)}
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-4 border-t border-lt-line pt-3">
        <dt className="font-semibold">المجموع عند الاستلام</dt>
        <dd className="shrink-0 text-[20px] font-semibold tabular-nums">{total !== null ? formatDZD(total) : "—"}</dd>
      </div>
    </dl>
  );
}

function QuantityRow({ quantity, onQuantityChange }: { quantity: number; onQuantityChange: (q: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span id="qty-label" className="text-[15px] font-medium">
        الكمية
      </span>
      <div role="group" aria-labelledby="qty-label" className="flex h-12 items-center border border-lt-line bg-white">
        <button
          type="button"
          onClick={() => onQuantityChange(quantity + 1)}
          aria-label="زيادة الكمية"
          className="flex h-full w-12 items-center justify-center"
        >
          <Plus size={18} />
        </button>
        <output aria-live="polite" className="w-10 text-center text-[17px] tabular-nums">
          {quantity}
        </output>
        <button
          type="button"
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          aria-label="إنقاص الكمية"
          disabled={quantity <= 1}
          className="flex h-full w-12 items-center justify-center disabled:text-lt-line"
        >
          <Minus size={18} />
        </button>
      </div>
    </div>
  );
}

// Delivery card. Before a wilaya is chosen it waits; a method without a valid backend price is disabled.
function ShippingOption({
  label,
  hint,
  price,
  pending,
  selected,
  onSelect,
}: {
  label: string;
  hint: string;
  price: number | null | undefined;
  pending: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const available = !pending && isValidPrice(price);
  const active = selected && available;
  return (
    <label
      className={`relative flex min-h-[104px] flex-col gap-0.5 rounded-[6px] border p-3.5 transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-lt-espresso ${
        active
          ? "border-lt-espresso bg-lt-ivory shadow-[inset_0_0_0_1px_#302B27]"
          : available
            ? "cursor-pointer border-lt-line bg-white hover:border-lt-taupe"
            : "cursor-not-allowed border-dashed border-lt-line bg-white text-lt-warmgray"
      }`}
    >
      <input type="radio" name="pdp-shipping" className="sr-only" checked={active} disabled={!available} onChange={onSelect} />
      <span
        aria-hidden
        className={`absolute end-3.5 top-4 size-[18px] rounded-full border ${
          active ? "border-[5px] border-lt-espresso" : available ? "border-lt-taupe" : "border-lt-line"
        }`}
      />
      <span className="pe-7 text-[15.5px] font-semibold">{label}</span>
      <span className={`text-[13.5px] leading-[1.5] ${available ? "text-lt-desc" : ""}`}>{hint}</span>
      <span className="mt-auto pt-1.5 text-[17px] font-semibold tabular-nums">
        {pending ? "—" : available ? formatShipping(price) : <span className="text-[14px] font-medium">غير متوفر</span>}
      </span>
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-[13.5px] leading-[1.5] text-lt-error">
      <AlertCircle size={15} className="shrink-0" aria-hidden />
      {message}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProductImageCard({ product }: { product: Product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(null);

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [shippingType, setShippingType] = useState<"domicile" | "bureau">("domicile");
  const [selectedColor, setSelectedColor] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState("5.0");

  const checkoutStartedRef = useRef(false);



  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Optional: one retry, then the rating stays hidden.
        const reviewsData = await withRetry(
          () => api.filterReviews({ approved: true, productId: product.id }),
          [1500]
        );

        setReviews(reviewsData);

        if (reviewsData.length > 0) {
          const avg =
            reviewsData.reduce(
              (acc, review) => acc + Number(review.rating || 0),
              0
            ) / reviewsData.length;

          setAverageRating(avg.toFixed(1));
        }
      } catch (error) {
        console.warn("Reviews unavailable:", error);
      }
    };

    if (product?.id) {
      fetchReviews();
    }
  }, [product?.id]);

  // Delivery data is required to order: on failure the form shows a retry instead of any price.
  const [countriesStatus, setCountriesStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    let active = true;
    loadCountries()
      .then((list) => {
        if (!active) return;
        setCountries(list);
        setCountriesStatus("ready");
      })
      .catch((error) => {
        console.warn("Wilayas unavailable:", error);
        if (active) setCountriesStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const retryCountries = () => {
    setCountriesStatus("loading");
    loadCountries()
      .then((list) => {
        setCountries(list);
        setCountriesStatus("ready");
      })
      .catch((error) => {
        console.warn("Wilayas unavailable:", error);
        setCountriesStatus("error");
      });
  };

  const images: string[] = useMemo(() => {
    try {
      if (Array.isArray(product.images))
        return product.images.length > 0 ? product.images : [placeholderImage.src];
      if (typeof product.images === "string") {
        const parsed = JSON.parse(product.images);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [placeholderImage.src];
      }
      return [placeholderImage.src];
    } catch {
      return [placeholderImage.src];
    }
  }, [product.images]);

  const otherInfo: OtherInfoItem[] = useMemo(() => {
    try {
      if (!product.otherInfo) return [];
      const parsed =
        typeof product.otherInfo === "string"
          ? JSON.parse(product.otherInfo)
          : product.otherInfo;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [product.otherInfo]);

  // ─── Parse colorsImages mapping ──────────────────────────────────────────
  const colorsImages: ColorImage[] = useMemo(() => {
    try {
      // Handle undefined, null, already-parsed array, or JSON string
      if (!product.colorsImages) return [];
      const parsed =
        typeof product.colorsImages === "string"
          ? JSON.parse(product.colorsImages)
          : product.colorsImages;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [product.colorsImages]);



  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Inline validation: a field is checked when it loses focus, then on every change.
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      phone: "",
      size: "S",
      country: "",
      commune: "",
      shippingType: "domicile",
    },
  });

  const selectedSize = watch("size");

  const imageUrl = (src: string) => (src.startsWith("/") ? src : getImageUrl(src));

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = countries.find((c) => String(c.id) === e.target.value) ?? null;
    setSelectedCountry(found);
    setValue("country", found ? String(found.id) : "");
    setValue("commune", "");
    if (found) {
      const parsed: Commune[] =
        typeof found.communes === "string" ? JSON.parse(found.communes) : found.communes;
      setCommunes(parsed);
    } else {
      setCommunes([]);
    }
  };

  // ─── Derived shipping values ──────────────────────────────────────────────
  const selectedShippingPrice: number = selectedCountry
    ? shippingType === "domicile"
      ? selectedCountry.price1 ?? 0
      : selectedCountry.price2 ?? 0
    : 0;

  const selectedShippingMethod: string =
    shippingType === "domicile" ? "إلى باب المنزل" : "إلى المكتب";

  const priceFor = (country: Country | null, type: "domicile" | "bureau") =>
    country ? (type === "domicile" ? country.price1 : country.price2) : null;

  // Wilaya change: the existing handler, then keep a delivery method that has a valid backend price.
  const onCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleCountryChange(e);
    const found = countries.find((c) => String(c.id) === e.target.value) ?? null;
    const parsed: Commune[] = found
      ? typeof found.communes === "string"
        ? JSON.parse(found.communes)
        : found.communes
      : [];
    setValue("communeRequired", parsed.length > 0);
    let type = shippingType;
    if (found && !isValidPrice(priceFor(found, type))) {
      const other = type === "domicile" ? "bureau" : "domicile";
      if (isValidPrice(priceFor(found, other))) type = other;
    }
    if (type !== shippingType) {
      setShippingType(type);
      setValue("shippingType", type);
    }
    setValue("shippingAvailable", found ? isValidPrice(priceFor(found, type)) : undefined);
    if (isSubmitted) void trigger(["commune", "shippingType"]);
  };

  const selectShipping = (type: "domicile" | "bureau") => {
    setShippingType(type);
    setValue("shippingType", type);
    setValue("shippingAvailable", isValidPrice(priceFor(selectedCountry, type)));
    if (isSubmitted) void trigger("shippingType");
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    // One full-name field, split by splitFullName into the existing name / surName keys.
    const { name: firstName, surName: lastName } = splitFullName(data.fullName);
    const colorInt = selectedColor
      ? parseInt(selectedColor.replace("#", ""), 16)
      : null;

    const productPrice = (product.discountPrice || product.price) * quantity;
    const totalAmount = productPrice + selectedShippingPrice;

    const selectedCommune = communes.find(
      (cm) => cm.nameAr === data.commune || String(cm.id) === data.commune
    );

    try {
      await api.addOrder({
        productId: product.id,
        quantity,
        totalAmount: productPrice,
        size: data.size,
        name: firstName,
        surName: lastName,
        city: data.commune || data.country || "",
        contact: data.phone,
        status: "In Process",
        address: "null",
        country: selectedCountry ? selectedCountry.nameAr : undefined,
        countryPrice1: selectedCountry?.price1 ?? null,
        countryPrice2: selectedCountry?.price2 ?? null,
        color: colorInt,
        selectedShippingPrice,
        selectedShippingMethod,
      });

      await trackFacebookEvent({
        eventName: FB_EVENTS.PURCHASE,
        value: totalAmount,
        currency: "DZD",
        contentIds: [String(product.id)],
        contentName: product.title,
        contentType: "product",
        contents: [
          {
            id: String(product.id),
            quantity,
            item_price: product.discountPrice || product.price,
          },
        ],
        numItems: quantity,

        phone: data.phone,
        firstName,
        lastName,
        city: selectedCommune?.nameAr || data.commune || "",
        state: selectedCountry?.nameAr || "",
        country: "dz",
      });

      setShowThankYou(true);

      reset();
      checkoutStartedRef.current = false;
      setQuantity(1);
      setSelectedCountry(null);
      setSelectedColor("");
      setCommunes([]);
      setShippingType("domicile");
    } catch (error) {
      console.error(error);
      const { toast } = await import("react-toastify");
      toast.error("حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedOtherInfo =
    typeof otherInfo === "string"
      ? JSON.parse(otherInfo)
      : otherInfo || [];

  const dynamicOtherInfoItems =
    parsedOtherInfo.length > 0
      ? parsedOtherInfo.map((item: any, idx: number) => ({
        title: item.question,
        content: (
          <p className="text-[15px] leading-[1.8] text-black/60 whitespace-pre-line">
            {item.answer}
          </p>
        ),
      }))
      : [
        {
          title: "سياسة التوصيل",
          content: (
            <p className="text-[16px] leading-[1.8] text-black/60">
              يتم التوصيل خلال 3-5 أيام عمل إلى جميع الولايات.
            </p>
          ),
        },
      ];

  // ─── Accordion items ──────────────────────────────────────────────────────
  // The size guide (product.tableImage) is shown next to the size selector instead of in the accordion.
  const accordionItems = dynamicOtherInfoItems;

  const scrollToForm = () => {
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const trackCheckoutStarted = () => {
    if (checkoutStartedRef.current) return;
    checkoutStartedRef.current = true;

    const productPrice = (product.discountPrice || product.price) * quantity;

    void trackFacebookEvent({
      eventName: FB_EVENTS.INITIATE_CHECKOUT,
      value: productPrice + selectedShippingPrice,
      currency: "DZD",
      contentIds: [String(product.id)],
      contentName: product.title,
      contentType: "product",
      contents: [
        {
          id: String(product.id),
          quantity,
          item_price: product.discountPrice || product.price,
        },
      ],
      numItems: quantity,
      country: "dz",
    });
  };

  // ─── Parse colors from product.colors ────────────────────────────────────
  const colors: string[] = useMemo(() => {
    try {
      const parsed =
        typeof product.colors === "string" ? JSON.parse(product.colors) : product.colors;
      if (!Array.isArray(parsed)) return [];
      return parsed.map((num: number) => `#${Number(num).toString(16).padStart(6, "0").slice(-6)}`);
    } catch {
      return [];
    }
  }, [product.colors]);

  // ─── Derive colors from colorsImages when product.colors is null ──────────
  const derivedColors: string[] = useMemo(() => {
    if (colors.length > 0) return colors;
    if (colorsImages.length === 0) return [];
    return colorsImages.map(
      (ci) => `#${Number(ci.color).toString(16).padStart(8, "0").slice(-6)}`
    );
  }, [colors, colorsImages]);

  const fieldCls =
    "h-[52px] w-full rounded-[4px] border border-lt-line bg-white px-4 text-right text-[16px] text-lt-espresso placeholder:text-lt-warmgray outline-none transition-colors focus:border-lt-espresso focus:ring-2 focus:ring-lt-espresso/10 aria-[invalid=true]:border-lt-error disabled:bg-lt-sand/60 disabled:text-lt-warmgray";
  const selectCls = `${fieldCls} appearance-none pl-10`;

  const subtotal = (product.discountPrice || product.price) * quantity;
  const chosenPrice = priceFor(selectedCountry, shippingType);
  const summaryShipping = selectedCountry && isValidPrice(chosenPrice) ? chosenPrice : null;

  const sizes: string[] =
    typeof product.sizeInfo === "string"
      ? JSON.parse(product.sizeInfo || "[]")
      : product.sizeInfo || ["XS", "S", "M", "L"];

  const unitPrice = product.discountPrice || product.price;
  // The backend stores an empty subtitle as the string "null".
  const subTitle = product.subTitle && product.subTitle !== "null" ? product.subTitle : null;
  const discount =
    product.discountPrice && product.price > product.discountPrice
      ? Math.round((1 - product.discountPrice / product.price) * 100)
      : null;

  // One sticky bar on mobile; it hides while the order form is on screen.
  const formRef = useRef<HTMLDivElement>(null);
  const [formVisible, setFormVisible] = useState(true);
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), {
      rootMargin: "0px 0px -15% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      {showThankYou && <ThankYouModal onClose={() => setShowThankYou(false)} />}

      <div className={`w-full bg-lt-ivory text-lt-espresso`}>
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_420px] md:items-start md:gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-16">
          {/* ── GALLERY ─────────────────────────────────────────────────── */}
          <div className="md:sticky md:top-28">
            <PdpGallery
              images={images}
              imageUrl={imageUrl}
              title={product.title}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
            />
          </div>

          {/* ── DETAILS ─────────────────────────────────────────────────── */}
          <div className="px-4 pt-5 text-right md:px-0 md:pt-0">
            <h1 className="pdp-display text-[23px] font-semibold leading-[1.4] text-lt-espresso text-balance md:text-[2rem]">
              {product.title}
            </h1>
            {subTitle && <p className="mt-1 text-[14px] text-lt-desc">{subTitle}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <p className="text-[26px] font-semibold leading-none tabular-nums text-lt-espresso md:text-[28px]">
                {formatDZD(unitPrice)}
              </p>
              {product.discountPrice ? (
                <>
                  <s className="text-[15px] text-lt-warmgray tabular-nums decoration-1">
                    <span className="sr-only">بدلًا من </span>
                    {formatDZD(product.price)}
                  </s>
                  {discount !== null && (
                    <span dir="ltr" className="rounded-[2px] bg-lt-blush px-2 py-0.5 text-[13px] font-medium tabular-nums text-lt-brown">
                      −{discount}%
                    </span>
                  )}
                </>
              ) : null}
              {reviews.length > 0 && (
                <span className="ms-auto inline-flex items-center gap-1 text-[14px]">
                  <Star size={15} fill="#A78D77" className="text-lt-taupe" aria-hidden />
                  {averageRating}
                  <span className="text-lt-muted">({reviews.length} مراجعة)</span>
                </span>
              )}
            </div>

            <ul className="mt-5 space-y-3 border-y border-lt-line py-4">
              {[
                { Icon: Banknote, label: "الدفع عند الاستلام" },
                { Icon: PackageOpen, label: "افتحي الطرد قبل الدفع" },
                { Icon: Truck, label: "التوصيل إلى كل الولايات" },
              ].map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-right">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-lt-beige">
                    <Icon size={18} strokeWidth={1.6} className="text-lt-taupe" aria-hidden />
                  </span>
                  <span className="text-[14.5px] text-lt-espresso">{label}</span>
                </li>
              ))}
            </ul>

            {product.description && (
              <p className="mt-5 text-[15px] leading-[1.9] text-lt-desc whitespace-pre-line">{product.description}</p>
            )}

            {/* ── SIZE ─────────────────────────────────────────────────── */}
            <div id="pdp-size" className="mt-8 scroll-mt-28">
              <div className="mb-3 flex items-center justify-between">
                <p id="pdp-size-label" className="text-[15px] font-semibold">
                  المقاس: <span className="ms-0.5 font-normal text-lt-muted">{selectedSize}</span>
                </p>
                {product.tableImage && (
                  <button
                    type="button"
                    onClick={() => setGuideOpen((o) => !o)}
                    aria-expanded={guideOpen}
                    aria-controls="pdp-size-guide"
                    className="inline-flex min-h-11 items-center gap-1.5 text-[14px] text-lt-espresso underline decoration-lt-taupe underline-offset-[6px]"
                  >
                    <Ruler size={16} aria-hidden />
                    دليل المقاسات
                  </button>
                )}
              </div>
              <div role="radiogroup" aria-labelledby="pdp-size-label" className="grid grid-cols-6 gap-2">
                {sizes.map((size: string) => {
                  const selected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setValue("size", size)}
                      className={`h-12 border text-[15px] font-medium tabular-nums transition-colors ${
                        selected
                          ? "border-lt-espresso bg-lt-espresso text-lt-ivory"
                          : "border-lt-line bg-white hover:border-lt-espresso"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {errors.size && <p className="mt-2 text-[13px] text-lt-error">{errors.size.message}</p>}
              {guideOpen && product.tableImage && (
                <div id="pdp-size-guide" className="mt-3 bg-lt-sand p-2">
                  <Image
                    src={imageUrl(product.tableImage)}
                    alt="دليل المقاسات"
                    width={800}
                    height={600}
                    sizes="(min-width: 768px) 460px, 100vw"
                    className="h-auto w-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* ── COLORS ───────────────────────────────────────────────── */}
            {derivedColors.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-[15px] font-semibold">اللون</p>
                <div className="flex flex-wrap gap-3">
                  {derivedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`اللون ${color}`}
                      aria-pressed={selectedColor === color}
                      onClick={() => {
                        setSelectedColor(color);
                        setValue("color", color);

                        // Switch gallery to the image associated with this color
                        const colorInt = parseInt(color.replace("#", ""), 16);
                        const match = colorsImages.find((ci) => {
                          // Compare last 6 hex digits to handle alpha-prefixed integers
                          const ciHex = Number(ci.color).toString(16).slice(-6);
                          const selHex = colorInt.toString(16).padStart(6, "0").slice(-6);
                          return ciHex === selHex;
                        });
                        if (match !== undefined) {
                          setSelectedImageIndex(match.imageIndex);
                        }
                      }}
                      className={`relative size-11 shrink-0 rounded-full border-2 transition-all ${selectedColor === color ? "scale-90 border-lt-espresso" : "border-black/10"}`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="size-2 rounded-full bg-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── ORDER FORM (submission, payload and tracking unchanged) ── */}
            <div id="order-form" ref={formRef} className="mt-10 scroll-mt-24 rounded-[6px] border border-lt-line bg-white px-4 pt-6 pb-5 md:p-7">
              <h2 className="pdp-display text-[23px] font-semibold">أكملي طلبك</h2>
              <p className="mt-1 text-[14.5px] text-lt-desc">الدفع نقدًا عند الاستلام</p>

              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                onInputCapture={trackCheckoutStarted}
                className="mt-6 space-y-5"
              >
                <div>
                  <label htmlFor="pdp-fullName" className="mb-2 block text-[15px] font-medium">
                    الاسم واللقب
                  </label>
                  <input
                    id="pdp-fullName"
                    autoComplete="name"
                    placeholder="أدخلي اسمك ولقبك"
                    {...register("fullName")}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "err-fullName" : undefined}
                    className={fieldCls}
                  />
                  <FieldError id="err-fullName" message={errors.fullName?.message} />
                </div>

                <div>
                  <label htmlFor="pdp-phone" className="mb-2 flex items-baseline justify-between text-[15px] font-medium">
                    رقم الهاتف <span className="text-[13.5px] font-normal text-lt-desc">للاتصال وتأكيد الطلب</span>
                  </label>
                  <input
                    id="pdp-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    dir="ltr"
                    placeholder="0555 12 34 56"
                    {...register("phone")}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                    className={`${fieldCls} tracking-wide`}
                  />
                  <FieldError id="err-phone" message={errors.phone?.message} />
                </div>

                <div>
                  <label htmlFor="pdp-wilaya" className="mb-2 block text-[15px] font-medium">
                    الولاية
                  </label>
                  <div className="relative">
                    <select
                      id="pdp-wilaya"
                      {...register("country", { onChange: onCountryChange })}
                      disabled={countriesStatus !== "ready"}
                      aria-invalid={!!errors.country || countriesStatus === "error"}
                      aria-describedby={
                        countriesStatus === "error" ? "err-countries-load" : errors.country ? "err-country" : undefined
                      }
                      aria-busy={countriesStatus === "loading"}
                      className={selectCls}
                      dir="rtl"
                    >
                      <option value="" disabled>
                        {countriesStatus === "loading"
                          ? "جاري تحميل الولايات…"
                          : countriesStatus === "error"
                            ? "الولايات غير متوفرة حاليًا"
                            : "اختاري الولاية"}
                      </option>
                      {countries.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.nameAr}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lt-muted" aria-hidden />
                  </div>
                  {countriesStatus === "error" ? (
                    <div
                      id="err-countries-load"
                      role="alert"
                      className="mt-2 flex items-center justify-between gap-3 rounded-[4px] border border-lt-error/30 bg-lt-blush/60 py-1.5 ps-3 pe-1.5"
                    >
                      <p className="flex items-center gap-1.5 text-[13.5px] leading-[1.5] text-lt-error">
                        <AlertCircle size={15} className="shrink-0" aria-hidden />
                        تعذّر تحميل الولايات وأسعار التوصيل.
                      </p>
                      <button
                        type="button"
                        onClick={retryCountries}
                        className="min-h-11 shrink-0 rounded-[4px] border border-lt-espresso bg-white px-3 text-[14px] font-medium text-lt-espresso"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  ) : (
                    <FieldError id="err-country" message={errors.country?.message} />
                  )}
                </div>

                <div>
                  <label htmlFor="pdp-commune" className="mb-2 block text-[15px] font-medium">
                    البلدية
                  </label>
                  <div className="relative">
                    <select
                      id="pdp-commune"
                      {...register("commune")}
                      disabled={communes.length === 0}
                      aria-invalid={!!errors.commune}
                      aria-describedby={errors.commune ? "err-commune" : undefined}
                      className={selectCls}
                      dir="rtl"
                    >
                      <option value="" disabled>{selectedCountry ? "اختاري البلدية" : "اختاري الولاية أولًا"}</option>
                      {communes.map((cm) => (
                        <option key={cm.id} value={cm.nameAr}>
                          {cm.nameAr}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lt-muted" aria-hidden />
                  </div>
                  <FieldError id="err-commune" message={errors.commune?.message} />
                </div>

                <fieldset aria-describedby={errors.shippingType ? "err-shipping" : undefined}>
                  <legend className="mb-2 text-[15px] font-medium">طريقة التوصيل</legend>
                  <div className="grid grid-cols-2 gap-2.5">
                    <ShippingOption
                      label="إلى باب المنزل"
                      hint="يوصلك الطرد إلى البيت"
                      price={selectedCountry?.price1}
                      pending={!selectedCountry}
                      selected={shippingType === "domicile"}
                      onSelect={() => selectShipping("domicile")}
                    />
                    <ShippingOption
                      label="إلى المكتب"
                      hint="تستلمينه من مكتب التوصيل"
                      price={selectedCountry?.price2}
                      pending={!selectedCountry}
                      selected={shippingType === "bureau"}
                      onSelect={() => selectShipping("bureau")}
                    />
                  </div>
                  {!selectedCountry && (
                    <p className="mt-2 text-[13.5px] text-lt-desc">اختاري الولاية لعرض سعر التوصيل.</p>
                  )}
                  <FieldError id="err-shipping" message={errors.shippingType?.message} />
                </fieldset>

                <QuantityRow quantity={quantity} onQuantityChange={setQuantity} />

                <OrderSummary
                  title={product.title}
                  size={selectedSize}
                  quantity={quantity}
                  subtotal={subtotal}
                  shippingPrice={summaryShipping}
                  shippingLabel={
                    selectedCountry ? `${selectedShippingMethod}، ${selectedCountry.nameAr}` : null
                  }
                />

                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-[6px] border border-lt-line bg-lt-ivory px-4 py-3">
                    <PackageOpen size={22} strokeWidth={1.6} className="mt-0.5 shrink-0 text-lt-taupe" aria-hidden />
                    <div>
                      <p className="text-[15.5px] font-semibold leading-[1.6]">افتحي كولي قبل ما تخلصي</p>
                      <p className="text-[14px] leading-[1.6] text-lt-desc">تقدري تتأكدي من المقاس والجودة قبل الدفع.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-[6px] bg-lt-espresso text-[17px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(48,43,39,0.7)] transition-colors hover:bg-lt-espresso/90 active:translate-y-px disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lt-espresso"
                  >
                    {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
                  </button>
                  <p className="text-center text-[13.5px] text-lt-desc">لا دفع الآن. سنتصل بك لتأكيد الطلب قبل الشحن.</p>
                </div>
              </form>
            </div>

            {/* ── DETAILS (product.otherInfo) ──────────────────────────── */}
            <div className="mt-10 border-t border-lt-line">
              {accordionItems.map((item: { title: string; content: React.ReactNode }, i: number) => (
                <div key={i} className="border-b border-lt-line">
                  <button
                    type="button"
                    onClick={() => setOpenAccordionIndex(openAccordionIndex === i ? null : i)}
                    aria-expanded={openAccordionIndex === i}
                    className="flex min-h-14 w-full items-center justify-between gap-4 text-right text-[15px] font-medium"
                  >
                    <span>{item.title}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-lt-muted transition-transform duration-300 ${openAccordionIndex === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openAccordionIndex === i ? "max-h-[1000px] pb-5 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STICKY BAR (mobile, single) ──────────────────────────────── */}
        <div
          inert={formVisible}
          className={`fixed inset-x-0 bottom-0 z-[100] border-t border-lt-line bg-lt-ivory px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${
            formVisible ? "translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="min-w-0 max-w-[45%] text-[13px] leading-tight text-lt-muted">
              <p className="truncate">{product.title}</p>
              <p className="mt-0.5 text-[17px] font-semibold tabular-nums text-lt-espresso">{formatDZD(unitPrice)}</p>
            </div>
            <button
              type="button"
              onClick={scrollToForm}
              className="flex h-[52px] flex-1 items-center justify-center bg-lt-espresso text-[16px] font-semibold text-lt-ivory"
            >
              اطلبي الآن
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
