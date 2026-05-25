"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Minus,
  Plus,
  ShieldCheck,
  HandHeart,
  Star,
  ChevronDown,
  Truck,
  RotateCcw,
  BadgeCheck,
  X,
  CheckCircle2,
} from "lucide-react";

import { FB_EVENTS, trackFacebookEvent } from "@/lib/facebook";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, getImageUrl } from "@/lib/api";
import { Product, Review } from "@/types/api";

import placeholderImage from "../../../public/assets/placeholder-image.svg";
import Image from "next/image";

import dynamic from "next/dynamic";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300"],
});

const ProductGallery = dynamic(() => import("./ProductGallery"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 relative bg-[#F5F5F5] animate-pulse rounded-[4px] h-[500px] md:h-[750px]" />
  ),
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
const formSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  phone: z.string().min(8, "رقم الهاتف مطلوب"),
  size: z.string().min(1, "المقاس مطلوب"),
  color: z.string().optional(),
  country: z.string().optional(),
  commune: z.string().optional(),
  shippingType: z.enum(["domicile", "bureau"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Luxury Logo ──────────────────────────────────────────────────────────────
function LuxuryLogo() {
  return (
    <div
      className={`${montserrat.className} flex flex-col items-center justify-center select-none leading-none`}
    >
      <h1 className="uppercase font-extralight text-black whitespace-nowrap text-[22px] tracking-[10px]">
        LABELTEXTILE
      </h1>
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="h-[1px] bg-black/40 w-10" />
        <span className="uppercase text-black/70 font-light text-[10px] tracking-[6px]">
          ALGERIE
        </span>
        <div className="h-[1px] bg-black/40 w-10" />
      </div>
    </div>
  );
}

// ─── Thank You Modal ──────────────────────────────────────────────────────────
function ThankYouModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white w-full max-w-md rounded-[4px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-black/30 hover:text-black/60 transition-colors"
          aria-label="إغلاق"
        >
          <X size={20} />
        </button>

        {/* Top accent bar */}
        <div className="h-1 w-full bg-[#B3A495]" />

        <div className="flex flex-col items-center px-8 py-10 text-center" dir="rtl">
          {/* Logo */}
          <div className="mb-8">
            <LuxuryLogo />
          </div>

          {/* Check icon */}
          <div className="w-16 h-16 rounded-full bg-[#F5F0EB] flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-[#B3A495]" />
          </div>

          <h2 className="text-[22px] font-bold text-black mb-3">شكراً لطلبك!</h2>

          <p className="text-[15px] leading-[1.8] text-black/55 mb-2">
            تم استلام طلبك بنجاح وسيتم التواصل معك في أقرب وقت ممكن.
          </p>
          <p className="text-[13px] text-black/35 mb-8">نشكرك على ثقتك بـ LABELTEXTILE</p>

          {/* Trust badges */}
          <div className="w-full grid grid-cols-3 gap-0 border border-[#E9E1D8] rounded-[4px] overflow-hidden mb-8">
            {[
              { icon: <BadgeCheck size={15} className="text-[#B3A495]" />, label: "الدفع عند الاستلام" },
              { icon: <RotateCcw size={15} className="text-[#B3A495]" />, label: "إرجاع خلال 7 أيام" },
              { icon: <Truck size={15} className="text-[#B3A495]" />, label: "توصيل 1-3 أيام" },
            ].map((b, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 bg-[#FDFAF7] ${i < 2 ? "border-l border-[#E9E1D8]" : ""}`}
              >
                {b.icon}
                <span className="text-[10px] text-black/45 text-center leading-tight">{b.label}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={onClose}
            className="w-full h-12 bg-[#B3A495] hover:bg-[#a39485] text-[16px] font-medium rounded-[2px]"
          >
            متابعة التسوق
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Recap ──────────────────────────────────────────────────────────────
interface OrderRecapProps {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  shippingType: "domicile" | "bureau";
  selectedCountry: Country;
  images: string[];
  imageUrl: (src: string) => string;
  onQuantityChange: (q: number) => void;
}

const OrderRecap = ({
  product,
  quantity,
  selectedSize,
  selectedColor,
  shippingType,
  selectedCountry,
  images,
  imageUrl,
  onQuantityChange,
}: OrderRecapProps) => {
  const productPrice = (product.discountPrice || product.price) * quantity;
  const shippingPrice =
    shippingType === "domicile"
      ? selectedCountry.price1 ?? 0
      : selectedCountry.price2 ?? 0;
  const total = productPrice + shippingPrice;

  return (
    <div className="mt-6 rounded-[4px] border border-[#E9E1D8] overflow-hidden bg-[#FDFAF7]">
      <div className="bg-[#E9E1D8] px-5 py-3 text-right">
        <span className="text-[15px] font-semibold text-black/80 tracking-wide">ملخص الطلب</span>
      </div>

      <div className="flex items-center gap-4 px-5 py-4 border-b border-[#E9E1D8]" dir="rtl">
        <div className="relative w-16 h-20 flex-shrink-0 rounded-[3px] overflow-hidden bg-[#F0EBE5]">
          <Image src={imageUrl(images[0])} alt={product.title} fill sizes="64px" className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-black truncate">{product.title}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
            <span className="text-[13px] text-black/50">
              المقاس: <span className="text-black/70 font-medium">{selectedSize}</span>
            </span>
            {selectedColor && (
              <span className="flex items-center gap-1.5 text-[13px] text-black/50">
                اللون:
                <span className="inline-block w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: selectedColor }} />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2" dir="ltr">
            <button type="button" onClick={() => onQuantityChange(Math.max(1, quantity - 1))} className="w-7 h-7 flex items-center justify-center rounded-full border border-black/15 hover:bg-[#E9E1D8] transition-colors">
              <Minus size={11} />
            </button>
            <span className="w-6 text-center text-[14px] font-semibold">{quantity}</span>
            <button type="button" onClick={() => onQuantityChange(quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-full border border-black/15 hover:bg-[#E9E1D8] transition-colors">
              <Plus size={11} />
            </button>
          </div>
        </div>
        <div className="text-[16px] font-bold text-black flex-shrink-0">{productPrice.toLocaleString()} د.ج</div>
      </div>

      <div className="px-5 py-4 space-y-2.5 border-b border-[#E9E1D8]" dir="rtl">
        <div className="flex justify-between flex-row-reverse text-[14px] text-black/60">
          <span>{productPrice.toLocaleString()} د.ج</span>
          <span>المجموع الفرعي</span>
        </div>
        <div className="flex justify-between  flex-row-reverse text-[14px] text-black/60">
          <span className="text-[#B3A495] font-medium">{shippingPrice.toLocaleString()} د.ج</span>
          <span>
            التوصيل —{" "}
            <span className="text-black/40 text-[12px]">{shippingType === "domicile" ? "إلى باب المنزل" : "إلى المكتب"}</span>
          </span>
        </div>
      </div>

      <div className="flex justify-between  flex-row-reverse items-center px-5 py-4" dir="rtl">
        <span className="text-[20px] font-bold text-black">{total.toLocaleString()} د.ج</span>
        <span className="text-[15px] font-semibold text-black/70">المجموع الكلي</span>
      </div>

      <div className="grid grid-cols-3 gap-0 border-t border-[#E9E1D8]">
        {[
          { icon: <BadgeCheck size={16} className="text-[#B3A495]" />, label: "الدفع عند الاستلام" },
          { icon: <RotateCcw size={16} className="text-[#B3A495]" />, label: "إرجاع خلال 7 أيام" },
          { icon: <Truck size={16} className="text-[#B3A495]" />, label: "توصيل 1-3 أيام" },
        ].map((badge, i) => (
          <div key={i} className={`flex flex-col items-center gap-1.5 py-3 px-2 ${i < 2 ? "border-l border-[#E9E1D8]" : ""}`}>
            {badge.icon}
            <span className="text-[11px] text-black/50 text-center leading-tight">{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProductImageCard({ product }: { product: Product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(null);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [shippingType, setShippingType] = useState<"domicile" | "bureau">("domicile");
  const [selectedColor, setSelectedColor] = useState("");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState("5.0");

  const imageColRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<any>(null);
  const checkoutStartedRef = useRef(false);

  useEffect(() => {
    setIsRTL(
      document.documentElement.dir === "rtl" ||
      document.documentElement.lang?.startsWith("ar"),
    );
  }, []);


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const reviewsData = await api.filterReviews({
          approved: true,
          productId: product.id,
        });

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
        console.error("Failed to fetch reviews:", error);
      }
    };

    if (product?.id) {
      fetchReviews();
    }
  }, [product?.id]);

  useEffect(() => {
    fetch("https://back.testwebapp.space/getCountries")
      .then((r) => r.json())
      .then((json) => setCountries(json.data ?? []))
      .catch(console.error);
  }, []);

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

  useEffect(() => {
    if (swiperRef.current) swiperRef.current.slideTo(selectedImageIndex);
  }, [selectedImageIndex]);

  useEffect(() => {
    const handleScroll = () => setShowStickyButton(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      size: "S",
      shippingType: "domicile",
    },
  });

  const selectedSize = watch("size");

  const imageUrl = (src: string) => (src.startsWith("/") ? src : getImageUrl(src));
  const nextImage = () => setSelectedImageIndex((p) => (p + 1) % images.length);
  const prevImage = () => setSelectedImageIndex((p) => (p - 1 + images.length) % images.length);

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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    const names = data.fullName.trim().split(/\s+/);
    const firstName = names[0];
    const lastName = names.slice(1).join(" ") || " ";
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
  const accordionItems = useMemo(() => {
    const items = [...dynamicOtherInfoItems];

    // insert size guide at 2nd position (index 1)
    if (product.tableImage) {
      items.splice(1, 0, {
        title: "دليل المقاسات",
        content: (
          <div className="w-full overflow-x-auto">
            <Image
              src={imageUrl(product.tableImage)}
              alt="دليل المقاسات"
              width={800}
              height={600}
              className="w-full h-auto rounded-[4px] object-contain"
            />
          </div>
        ),
      });
    }

    return items;
  }, [dynamicOtherInfoItems, product.tableImage]);

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

  const selectCls =
    "w-full h-14 bg-[#F9F9F9] border border-black/10 rounded-[2px] text-right px-4 appearance-none outline-none focus:ring-1 focus:ring-[#B3A495] pr-4 pl-10";

  const showRecap = !!selectedCountry && !!selectedSize;

  return (
    <>
      {showThankYou && <ThankYouModal onClose={() => setShowThankYou(false)} />}

      <div className="w-full overflow-hidden">
        <div
          ref={sectionRef}
          className="flex flex-col md:flex-row gap-0 sm:gap-5 lg:gap-10 h-auto md:h-[1000px] w-full min-w-0"
        >
          {/* ── IMAGE GALLERY ────────────────────────────────────────────── */}
          <div
            ref={imageColRef}
            className="flex-1 flex flex-col md:overflow-y-auto no-scrollbar order-1 md:order-2 h-full w-full min-w-0"
          >
            <div className="flex flex-col md:flex-row gap-4 mb-10 h-auto md:h-[750px] flex-shrink-0 w-full">
              <ProductGallery
                images={images}
                imageUrl={imageUrl}
                selectedImageIndex={selectedImageIndex}
                setSelectedImageIndex={setSelectedImageIndex}
                isRTL={isRTL}
                swiperRef={swiperRef}
                prevImage={prevImage}
                nextImage={nextImage}
              />

              <div className="hidden md:flex flex-col gap-3 w-[100px] p-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-[3/4] w-full overflow-hidden rounded-[4px] transition-all ${selectedImageIndex === index ? "ring-2 ring-[#B3A495]" : "opacity-60 hover:opacity-100"}`}
                  >
                    <Image
                      src={imageUrl(img)}
                      alt={`Thumbnail ${index + 1}`}
                      quality={75}
                      loading="lazy"
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ACCORDION DESKTOP */}
            <div className="hidden md:block space-y-2 pb-10">
              {accordionItems.map((item, i) => (
                <div key={i} className="border-b border-[#E9E9E9]">
                  <button
                    onClick={() =>
                      setOpenAccordionIndex(openAccordionIndex === i ? null : i)
                    }
                    className="flex w-full items-center justify-between py-6 text-right"
                  >
                    <span className="text-[20px] font-medium text-black">
                      {item.title}
                    </span>

                    <ChevronDown
                      className={`h-5 w-5 text-black transition-transform duration-500 ${openAccordionIndex === i ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${openAccordionIndex === i
                      ? "max-h-[1000px] opacity-100 pb-8"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PRODUCT DETAILS / FORM ───────────────────────────────────── */}
          <div
            id="order-form"
            className="flex-1 flex flex-col items-start w-full text-right order-2 md:order-1 h-full md:overflow-y-auto no-scrollbar px-0 min-w-0"
          >
            <h1 className="text-[32px] md:text-[42px] font-bold leading-tight text-black mb-4">
              {product.title}
            </h1>

            <div className="flex items-start flex-col justify-start gap-8 mb-8">
              <div className="text-[28px] font-bold text-black">
                {product.discountPrice || product.price} د.ج
                {product.discountPrice && (
                  <span className="text-[16px] line-through text-black/40 mr-3">
                    {product.price} د.ج
                  </span>
                )}
              </div>
              {product.description && (
                <p className="block text-[15px] leading-[1.8] text-black mb-6 text-right">
                  {product.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-black/40">
                  ({reviews.length} مراجعة)
                </span>

                <span className="text-[16px] font-medium text-black">
                  {averageRating}
                </span>

                <Star size={18} fill="#FFD700" className="text-[#FFD700]" />
              </div>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              onInputCapture={trackCheckoutStarted}
              className="space-y-6 w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1 col-span-2">
                  <Input
                    placeholder="الاسم الكامل"
                    {...register("fullName")}
                    className="h-14 bg-[#F9F9F9] border border-black/10 rounded-[2px] text-right"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1 col-span-2">
                  <Input
                    placeholder="رقم الهاتف"
                    {...register("phone")}
                    className="h-14 bg-[#F9F9F9] border border-black/10 rounded-[2px] text-right"
                  />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                </div>

                {/* Wilaya */}
                <div className="col-span-2 space-y-1">
                  <div className="relative">
                    <select
                      onChange={handleCountryChange}
                      defaultValue=""
                      className={selectCls}
                      required
                      dir="rtl"
                    >
                      <option value="" disabled>اختر الولاية</option>
                      {countries.map((c) => (
                        <option key={c.id} value={String(c.id)}>{c.nameAr}</option>
                      ))}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={20} className="text-black/40" />
                    </div>
                  </div>
                </div>

                {/* Commune */}
                {communes.length > 0 && (
                  <div className="col-span-2 space-y-1">
                    <div className="relative">
                      <select
                        {...register("commune")}
                        required
                        defaultValue=""
                        className={selectCls}
                        dir="rtl"
                      >
                        <option value="" disabled>اختر البلدية</option>
                        {communes.map((cm) => (
                          <option key={cm.id} value={cm.nameAr}>
                            {cm.nameAr}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown size={20} className="text-black/40" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── SIZE ──────────────────────────────────────────────────── */}
              <div className="space-y-3">
                <p className="text-[14px] text-black">اختر المقاس</p>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {(typeof product.sizeInfo === "string"
                    ? JSON.parse(product.sizeInfo || "[]")
                    : product.sizeInfo || ["XS", "S", "M", "L"]
                  ).map((size: string) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setValue("size", size)}
                      className={`h-11 w-20 flex-shrink-0 flex items-center justify-center text-[14px] rounded-[2px] transition-all ${selectedSize === size ? "bg-[#B3A495] text-white" : "bg-[#E9E1D8] text-black/60"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── COLORS ────────────────────────────────────────────────── */}
              {derivedColors.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[14px] text-black">اختر اللون</p>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {derivedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
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
                        className={`relative h-11 w-11 rounded-full border-2 transition-all flex-shrink-0 ${selectedColor === color ? "border-black scale-90" : "border-black/10"}`}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SHIPPING METHOD ───────────────────────────────────────── */}
              {selectedCountry && (
                <div className="space-y-3">
                  <p className="text-[14px] text-black text-right">اختر طريقة الشحن</p>
                  <div className="space-y-2">
                    <label className={`flex items-center justify-between gap-3 px-4 h-14 border rounded-[2px] cursor-pointer transition-all ${shippingType === "domicile" ? "border-[#B3A495] bg-[#F9F7F5]" : "border-black/10 bg-[#F9F9F9]"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingType === "domicile" ? "border-[#B3A495]" : "border-black/30"}`}>
                          {shippingType === "domicile" && <div className="w-2.5 h-2.5 rounded-full bg-[#B3A495]" />}
                        </div>
                        <span className="text-[15px] font-medium text-black">إلى باب المنزل</span>
                      </div>
                      {selectedCountry.price1 !== null
                        ? <span className="text-[15px] font-bold text-gray-400">{selectedCountry.price1} د.ج</span>
                        : <span className="text-[13px] text-black/40">99.99 د.ج</span>}
                      <input type="radio" className="hidden" checked={shippingType === "domicile"} onChange={() => { setShippingType("domicile"); setValue("shippingType", "domicile"); }} />
                    </label>

                    <label className={`flex items-center justify-between gap-3 px-4 h-14 border rounded-[2px] cursor-pointer transition-all ${shippingType === "bureau" ? "border-[#B3A495] bg-[#F9F7F5]" : "border-black/10 bg-[#F9F9F9]"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingType === "bureau" ? "border-[#B3A495]" : "border-black/30"}`}>
                          {shippingType === "bureau" && <div className="w-2.5 h-2.5 rounded-full bg-[#B3A495]" />}
                        </div>
                        <span className="text-[15px] font-medium text-black">إلى المكتب</span>
                      </div>
                      {selectedCountry.price2 !== null
                        ? <span className="text-[15px] font-bold text-gray-400">{selectedCountry.price2} د.ج</span>
                        : <span className="text-[13px] text-black/40">99.99 د.ج</span>}
                      <input type="radio" className="hidden" checked={shippingType === "bureau"} onChange={() => { setShippingType("bureau"); setValue("shippingType", "bureau"); }} />
                    </label>
                  </div>
                </div>
              )}

              {/* ── ORDER RECAP ───────────────────────────────────────────── */}
              {showRecap && (
                <div className="transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-top-2" style={{ animationDuration: "400ms" }}>
                  <OrderRecap
                    product={product}
                    quantity={quantity}
                    selectedSize={selectedSize}
                    selectedColor={selectedColor}
                    shippingType={shippingType}
                    selectedCountry={selectedCountry!}
                    images={images}
                    imageUrl={imageUrl}
                    onQuantityChange={setQuantity}
                  />
                </div>
              )}

              {/* ── BUY BUTTON ────────────────────────────────────────────── */}
              <div className="flex gap-4 items-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-14 bg-[#B3A495] hover:bg-[#a39485] text-[20px] font-medium rounded-[2px]"
                >
                  {isSubmitting ? "جاري المعالجة..." : "اشتري الآن"}
                </Button>
                {!showRecap && (
                  <div className="flex items-center border border-black/10 h-14">
                    <button type="button" onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))} className="w-12 h-full flex items-center justify-center hover:bg-black/5">
                      <Minus size={16} />
                    </button>
                    <div className="w-12 h-full flex items-center justify-center text-[18px]">{quantity}</div>
                    <button type="button" onClick={() => setQuantity((q) => q + 1)} className="w-12 h-full flex items-center justify-center hover:bg-black/5">
                      <Plus size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* ── FEATURES ──────────────────────────────────────────────── */}
              {!showRecap && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center justify-center gap-4 bg-black/5 py-5 rounded-[2px]">
                    <HandHeart size={22} className="text-[#B3A495]" />
                    <span className="text-[16px] font-medium">جودة عالية</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 bg-black/5 py-5 rounded-[2px]">
                    <ShieldCheck size={22} className="text-[#B3A495]" />
                    <span className="text-[16px] font-medium">توصيل سريع</span>
                  </div>
                </div>
              )}
            </form>

            {/* MOBILE ACCORDION */}
            <div className="block md:hidden space-y-2 py-10">
              {accordionItems.map((item, i) => (
                <div key={i} className="border-b border-[#E9E9E9]">
                  <button
                    onClick={() =>
                      setOpenAccordionIndex(openAccordionIndex === i ? null : i)
                    }
                    className="flex w-full items-center justify-between py-6 text-right"
                  >
                    <span className="text-[20px] font-medium text-black">
                      {item.title}
                    </span>

                    <ChevronDown
                      className={`h-5 w-5 text-black transition-transform duration-500 ${openAccordionIndex === i ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${openAccordionIndex === i
                      ? "max-h-[1000px] opacity-100 pb-8"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STICKY BUTTON */}
        <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-black/5 transition-all duration-500 z-[100] ${showStickyButton ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
          <Button
            onClick={scrollToForm}
            className="w-full h-14 bg-[#B3A495] hover:bg-[#a39485] text-[20px] font-medium rounded-[2px] shadow-lg"
          >
            اشتري الآن
          </Button>
        </div>
      </div>
    </>
  );
}
