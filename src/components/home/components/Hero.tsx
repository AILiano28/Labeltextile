import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { preload } from "react-dom";

// Owner-approved homepage banner (1774 × 887).
// - Tablet/desktop (≥ 768 px): the full banner. Its headline, subtitle and «تسوقي الآن» button are part of
//   the image, so nothing is drawn on top; the text below is screen-reader-only there.
// - Phones (< 768 px): the banner's text would be ~7–8 px, so phones get a square crop of the same image
//   (the model and the floral kimono) with the same headline, subtitle and button as real, readable text
//   underneath, in the banner's own colours.
// Pre-generated AVIF (q60, 4:4:4; phone crop q52) and WebP (q82) files in /public/assets/home, served as-is (no runtime
// image optimization). The whole hero is one link to the collections.
const DESKTOP = [640, 828, 1080, 1280, 1774];
const MOBILE = [480, 640, 828, 887];
const srcSet = (name: string, widths: number[], ext: "avif" | "webp") =>
  widths.map((w) => `/assets/home/${name}-${w}.${ext} ${w}w`).join(", ");
const PHONE = "(max-width: 767px)";
const DESKTOP_SIZES = "(min-width: 1920px) 1920px, 100vw";

export default function Hero() {
  // Each device class preloads only its own LCP image, starting with the HTML.
  preload("/assets/home/hero-mobile-828.avif", {
    as: "image",
    type: "image/avif",
    imageSrcSet: srcSet("hero-mobile", MOBILE, "avif"),
    imageSizes: "100vw",
    media: PHONE,
    fetchPriority: "high",
  });
  preload("/assets/home/hero-banner-1774.avif", {
    as: "image",
    type: "image/avif",
    imageSrcSet: srcSet("hero-banner", DESKTOP, "avif"),
    imageSizes: DESKTOP_SIZES,
    media: "(min-width: 768px)",
    fetchPriority: "high",
  });

  return (
    // Top padding = height of the fixed navbar (70 px on phones, logo row + menu on desktop).
    <section className="relative w-full bg-[#E6CDBD] pt-[70px] md:pt-[118px]">
      <Link
        href="/cataProducts"
        aria-label="تسوقي الآن: تشكيلة الكيمونو والعبايات المنزلية"
        className="mx-auto block max-w-[1920px]"
      >
        <picture>
          <source media={PHONE} type="image/avif" srcSet={srcSet("hero-mobile", MOBILE, "avif")} sizes="100vw" />
          <source media={PHONE} type="image/webp" srcSet={srcSet("hero-mobile", MOBILE, "webp")} sizes="100vw" />
          <source type="image/avif" srcSet={srcSet("hero-banner", DESKTOP, "avif")} sizes={DESKTOP_SIZES} />
          <source type="image/webp" srcSet={srcSet("hero-banner", DESKTOP, "webp")} sizes={DESKTOP_SIZES} />
          {/* Plain <img> inside <picture>: next/image can't serve per-format/per-device <source> sets.
              The aspect ratio (1:1 on phones, 2:1 from 768 px) reserves the space before the image loads. */}
          <img
            src="/assets/home/hero-banner-1774.webp"
            width={1774}
            height={887}
            alt="امرأة ترتدي كيمونو منزليًا بنقشة زهور في صالون دافئ"
            fetchPriority="high"
            className="block aspect-square h-auto w-full object-cover md:aspect-[1774/887]"
          />
        </picture>

        {/* Phones: the banner's text as real text. From 768 px the image carries it, so screen-reader-only. */}
        <div dir="rtl" className="px-6 pt-5 pb-9 text-right md:sr-only">
          <h1 className="text-[clamp(30px,8.4vw,38px)] font-medium leading-[1.25] text-[#2E1E14]">
            راحة وأناقة
            <br />
            في كل لحظة
          </h1>
          <p className="mt-3 text-[16px] leading-[1.7] text-[#4A3A30]">تشكيلة أنيقة من الكيمونو والعبايات المنزلية</p>
          <span className="mt-6 inline-flex h-12 items-center gap-3 rounded-md bg-[#452F23] px-7 text-[16px] font-medium text-white">
            تسوقي الآن
            <ArrowRight size={18} strokeWidth={1.8} aria-hidden />
          </span>
        </div>
      </Link>
    </section>
  );
}
