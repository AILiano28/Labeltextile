import React from "react";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/types/api";
import Link from "next/link";
import dynamic from "next/dynamic";

import placeholderImage from "../../../public/assets/placeholder-image.svg";

const ProductImageSlider = dynamic(() => import("../ProductImageSlider"), {
  ssr: true,
  loading: () => (
    <div className="relative w-full h-full bg-[#d9d9d9] animate-pulse" />
  ),
});

export default function CataProductCard({
  cataName,
  products = [],
}: {
  cataName?: string;
  products?: Product[];
}) {
  return (
    <section className="w-full overflow-hidden py-16 mt-10 md:mt-22">
      <div className="mx-auto container px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div className="mb-4 flex items-start justify-start gap-3">
          <h2 className="text-[32px] md:text-[56px] font-bold leading-none tracking-[-1px] md:tracking-[-2px] text-black">
            {cataName || products[0]?.cata_name || "Abaya"}
          </h2>

          <span className="mt-1 text-[18px] font-medium text-black/70">
            ({products.length})
          </span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-end justify-center gap-8">
          {products.length > 0 ? (
            products.map((product) => {
              const getImages = () => {
                try {
                  if (Array.isArray(product.images)) return product.images;
                  if (typeof product.images === "string") return JSON.parse(product.images);
                  return [];
                } catch { return []; }
              };
              const images = getImages();

              return (
                <div
                  key={product.id}
                  className="relative flex flex-col w-full h-auto"
                >
                  {/* Product Image Island */}
                  <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#d9d9d9]">
                    <ProductImageSlider 
                      images={images}
                      productTitle={product.title}
                      productId={product.id}
                      placeholderSrc={placeholderImage.src}
                    />
                  </div>

                  {/* Product Info (Static) */}
                  <div className="flex flex-col p-3 md:px-4 md:py-3 w-full">
                    <div className="flex justify-between items-start gap-4 mb-1">
                      <Link
                        href={`/productDetails/${product.id}`}
                        className="flex-1 min-w-0"
                      >
                        <h3 className="text-xl font-normal text-black truncate text-right">
                          {product.title}
                        </h3>
                      </Link>
                      <Link
                        href={`/productDetails/${product.id}`}
                        className="h-10 w-10 flex-shrink-0 rounded-full bg-[#F9F9F9] border border-black/5 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
                        aria-label={product.title}
                      >
                        <ShoppingBag size={20} />
                      </Link>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-black">
                        {product.price} د.ج
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl text-muted-foreground">No Products Found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
