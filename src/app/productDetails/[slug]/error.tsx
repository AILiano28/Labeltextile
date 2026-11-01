"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { naskh, plexArabic } from "@/components/productDetails/pdpFonts";
import "@/components/productDetails/pdp.css";
import PdpFontsGate from "@/components/productDetails/PdpFontsGate";

/**
 * Shown only when the product itself cannot be loaded (for example the backend is unreachable).
 * Optional data (reviews, best sellers) never reaches this page: those requests fail quietly.
 */
export default function ProductError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [retrying, startTransition] = useTransition();

  useEffect(() => {
    console.warn("Product unavailable:", error);
  }, [error]);

  // Re-run the server request, then re-render the segment.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <div dir="rtl" className={`pdp-root ${plexArabic.variable} ${naskh.variable} flex min-h-[70vh] items-center justify-center bg-[#FAF9F6] px-6 pt-24 pb-16`}>
      <PdpFontsGate />
      <div className="w-full max-w-sm text-center text-[#302B27]">
        <h1 className="pdp-display text-[22px] font-semibold leading-[1.5]">تعذّر تحميل المنتج حاليًا</h1>
        <p className="mt-2 text-[15px] leading-[1.75] text-[#625850]">
          قد يكون الاتصال ضعيفًا. حاولي مرة أخرى بعد لحظات.
        </p>
        <button
          type="button"
          onClick={retry}
          disabled={retrying}
          className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[6px] bg-[#302B27] text-[17px] font-semibold text-white transition-colors hover:bg-[#302B27]/90 disabled:opacity-70"
        >
          {retrying ? "جاري المحاولة…" : "إعادة المحاولة"}
        </button>
        <Link
          href="/cataProducts"
          className="mt-3 flex h-11 items-center justify-center text-[15px] text-[#302B27] underline decoration-[#A78D77] underline-offset-[6px]"
        >
          تصفّحي مجموعتنا
        </Link>
      </div>
    </div>
  );
}
