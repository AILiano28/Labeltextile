import Link from "next/link";
import { preload } from "react-dom";

// Owner-approved homepage banner (1774 × 887). The headline, subtitle and «تسوقي الآن» button are part of
// the image, so nothing is drawn on top of it; the whole banner is the link to the collections.
// Pre-generated AVIF (q60, 4:4:4) and WebP (q82) files in /public/assets/home, served as-is: no runtime
// image optimization, and colours, pattern and Arabic lettering stay as approved.
const WIDTHS = [640, 828, 1080, 1280, 1774];
const srcSet = (ext: "avif" | "webp") =>
  WIDTHS.map((w) => `/assets/home/hero-banner-${w}.${ext} ${w}w`).join(", ");
const SIZES = "(min-width: 1920px) 1920px, 100vw";

export default function Hero() {
  // Start the banner download with the HTML (it is the LCP image).
  preload("/assets/home/hero-banner-1774.avif", {
    as: "image",
    type: "image/avif",
    imageSrcSet: srcSet("avif"),
    imageSizes: SIZES,
    fetchPriority: "high",
  });

  return (
    // Top padding = height of the fixed navbar (70 px on phones, logo row + menu on desktop).
    <section className="relative w-full bg-[#EADCD0] pt-[70px] md:pt-[118px]">
      <h1 className="sr-only">راحة وأناقة في كل لحظة: تشكيلة أنيقة من الكيمونو والعبايات المنزلية</h1>
      <Link
        href="/cataProducts"
        aria-label="تسوقي الآن: تشكيلة الكيمونو والعبايات المنزلية"
        className="mx-auto block max-w-[1920px]"
      >
        <picture>
          <source type="image/avif" srcSet={srcSet("avif")} sizes={SIZES} />
          <source type="image/webp" srcSet={srcSet("webp")} sizes={SIZES} />
          {/* Plain <img> inside <picture>: next/image can't serve per-format <source> sets. width/height
              reserve the 2:1 space before the image loads (no layout shift). */}
          <img
            src="/assets/home/hero-banner-1774.webp"
            width={1774}
            height={887}
            alt="امرأة ترتدي كيمونو منزليًا بنقشة زهور في صالون دافئ، مع عبارة «راحة وأناقة في كل لحظة»"
            fetchPriority="high"
            className="block h-auto w-full"
          />
        </picture>
      </Link>
    </section>
  );
}
