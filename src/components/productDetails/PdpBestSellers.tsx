"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, getImageUrl } from "@/lib/api";
import { withRetry } from "@/lib/retry";
import { Product } from "@/types/api";

const formatDZD = (amount: number) =>
  `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} د.ج`;

const firstImage = (images: Product["images"]): string | null => {
  try {
    const list = typeof images === "string" ? JSON.parse(images) : images;
    return Array.isArray(list) && list.length > 0 ? list[0] : null;
  } catch {
    return null;
  }
};

/**
 * Product-page version of «أفضل المبيعات»: same data source as the home section
 * (api.filterProducts, current product excluded), shown as a compact swipe row
 * on mobile and a 4-column grid from md up. The home page keeps BestSellers.
 */
export default function PdpBestSellers({ excludeId, limit = 6 }: { excludeId?: number; limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optional section: one retry, then it stays hidden.
    withRetry(() => api.filterProducts(), [1500])
      .then((data) => setProducts(data.filter((p) => p.id !== excludeId).slice(0, limit)))
      .catch((error) => console.warn("Best sellers unavailable:", error))
      .finally(() => setLoading(false));
  }, [excludeId, limit]);

  if (!loading && products.length === 0) return null;

  return (
    <section aria-labelledby="pdp-bestsellers" className="text-lt-espresso">
      <div className="mb-5 flex items-end justify-between gap-4 px-4 md:px-0">
        <div>
          <h2 id="pdp-bestsellers" className="text-[22px] font-semibold">
            أفضل المبيعات
          </h2>
          <p className="mt-1 text-[14px] text-lt-muted">القطع الأكثر طلبًا من عميلاتنا</p>
        </div>
        <Link
          href="/cataProducts"
          className="inline-flex min-h-11 shrink-0 items-center text-[14px] underline decoration-lt-taupe underline-offset-[6px]"
        >
          عرض الكل
        </Link>
      </div>

      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="w-[44%] shrink-0 md:w-auto">
                <div className="aspect-[3/4] animate-pulse bg-lt-sand" />
                <div className="mt-2.5 h-4 w-3/4 animate-pulse bg-lt-sand" />
              </li>
            ))
          : products.map((product) => {
              const img = firstImage(product.images);
              const price = product.discountPrice || product.price;
              return (
                <li key={product.id} className="w-[44%] shrink-0 snap-start md:w-auto">
                  <Link href={`/productDetails/${product.id}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden bg-lt-sand">
                      {img && (
                        <Image
                          src={getImageUrl(img)}
                          alt={product.title}
                          fill
                          sizes="(min-width: 768px) 25vw, 44vw"
                          quality={75}
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <h3 className="mt-2.5 truncate text-[14.5px] font-medium">{product.title}</h3>
                    <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 tabular-nums">
                      <span className="text-[15px] font-semibold">{formatDZD(price)}</span>
                      {product.discountPrice && product.price > product.discountPrice ? (
                        <s className="text-[13px] text-lt-muted">{formatDZD(product.price)}</s>
                      ) : null}
                    </p>
                  </Link>
                </li>
              );
            })}
      </ul>
    </section>
  );
}
