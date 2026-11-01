"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/api";

// The swipeable slider (Swiper) is only downloaded when the card gets near the screen, so it doesn't
// compete with the hero and the CSS while the home page loads.
const ProductImageSlider = dynamic(() => import("./ProductImageSlider"), { ssr: false });

interface ProductCardGalleryProps {
  images: string[];
  productTitle: string;
  productId: number;
  placeholderSrc: string;
}

/**
 * Home page product card photo: the first photo as a plain image (server-rendered, lazy), replaced by the
 * full slider once the card is within ~300 px of the screen or is touched. Same box, same photo and the
 * same image URL as the slider's first slide, so the swap doesn't move or re-download anything.
 */
export default function ProductCardGallery({ images, productTitle, productId, placeholderSrc }: ProductCardGalleryProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) return;
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  const first = images[0];
  const firstSrc = !first || first === placeholderSrc ? placeholderSrc : getImageUrl(first);

  return (
    <div
      ref={boxRef}
      className="relative h-full w-full"
      onPointerEnter={() => setActive(true)}
      onTouchStart={() => setActive(true)}
    >
      <Link href={`/productDetails/${productId}`} className="block h-full w-full">
        <Image
          src={firstSrc}
          alt={productTitle}
          fill
          loading="lazy"
          quality={75}
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover object-top"
        />
      </Link>
      {active && (
        <div className="absolute inset-0">
          <ProductImageSlider
            images={images}
            productTitle={productTitle}
            productId={productId}
            placeholderSrc={placeholderSrc}
            priority={false}
          />
        </div>
      )}
    </div>
  );
}
