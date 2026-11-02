import { Product } from "@/types/api";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import ProductCardGallery from "./ProductCardGallery";
import placeholderImage from "../../public/assets/placeholder-image.svg";

export default function ProductCard({ product }: { product: Product }) {
  // Parse images
  const getImages = () => {
    try {
      if (Array.isArray(product.images)) return product.images;
      if (typeof product.images === "string") {
        return JSON.parse(product.images);
      }
      return [];
    } catch {
      return [];
    }
  };

  const images = getImages();
  const displayImages = images.length > 0 ? images : [placeholderImage.src];

  return (
    <div className="relative flex flex-col w-full h-auto group" dir="rtl">
      {/* Product Image Slider Island */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#d9d9d9]">
        {/* Only used in the home page product grid, below the hero: the first photo loads lazily and the
            swipeable slider (Swiper) only when the card gets near the screen. */}
        <ProductCardGallery
          images={images}
          productTitle={product.title}
          productId={product.id}
          placeholderSrc={placeholderImage.src}
        />
      </div>

      {/* Product Info (Pure Static) */}
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
          <p className="text-xl font-bold text-black">{product.price} د.ج</p>
        </div>
      </div>
    </div>
  );
}
