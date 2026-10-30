import PdpBestSellers from "@/components/productDetails/PdpBestSellers";
import { ProductImageCard } from "@/components/productDetails/ProductImageCard";
import { ProductReviews } from "@/components/productDetails/ProductReviews";
import { api } from "@/lib/api";
import type { Review } from "@/types/api";
import Link from "next/link";
import { preload } from "react-dom";
import { ToastProvider } from "@/components/ToastProvider";
import { naskh, plexArabic } from "@/components/productDetails/pdpFonts";
import "@/components/productDetails/pdp.css";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Start downloading wilayas and delivery prices with the HTML, in parallel with the JavaScript.
  // Same URL, mode and credentials as the browser fetch in ProductImageCard, so that fetch reuses it.
  // Low priority so the main product photo still downloads first.
  preload("https://back.testwebapp.space/getCountries", { as: "fetch", crossOrigin: "anonymous", fetchPriority: "low" });

  const { slug } = await params;
  const productId = parseInt(slug) || 1;

  // Parallel fetch on server. Reviews are optional: if they fail the page renders without them.
  // If the product itself fails, error.tsx shows a retry message.
  const [reviews, product] = await Promise.all([
    api.filterReviews({ approved: true, productId }).catch((error): Review[] => {
      console.warn("Reviews unavailable:", error);
      return [];
    }),
    api.getProductById(productId),
  ]);

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        المنتج غير موجود
      </div>
    );

  return (
    <div className={`pdp-root ${plexArabic.variable} ${naskh.variable} bg-lt-ivory text-lt-espresso`}>
      <ToastProvider />

      {/* Full-bleed gallery on mobile; the single sticky order bar lives inside ProductImageCard. */}
      <div className="mx-auto max-w-7xl pt-[70px] md:px-8 md:pt-44 lg:px-12">
        <ProductImageCard product={product} />
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-lt-line px-4 pt-10 md:px-8 lg:px-12">
        <ProductReviews initialReviews={reviews} productId={productId} />
      </div>

      <div className="mx-auto mt-14 max-w-7xl border-t border-lt-line pt-12 md:px-8 lg:px-12">
        <PdpBestSellers excludeId={productId} />
      </div>

      {/* Explore More Section */}
      <section className="flex flex-col items-center px-4 pt-12 pb-28 md:pb-20">
        <Link
          href="/cataProducts"
          className="inline-flex h-[52px] w-full max-w-sm items-center justify-center border border-lt-espresso text-[16px] font-medium text-lt-espresso transition-colors hover:bg-lt-espresso hover:text-lt-ivory"
        >
          اكتشف مجموعتنا
        </Link>
      </section>
    </div>
  );
}
