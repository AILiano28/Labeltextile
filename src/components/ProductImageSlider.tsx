"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

interface ProductImageSliderProps {
  images: string[];
  productTitle: string;
  productId: number;
  placeholderSrc: string;
  /** Load the first photo eagerly with a preload (default). Pass false when the card is below the first screen. */
  priority?: boolean;
}

export default function ProductImageSlider({
  images,
  productTitle,
  productId,
  placeholderSrc,
  priority = true,
}: ProductImageSliderProps) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const displayImages = images.length > 0 ? images : [placeholderSrc];

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      slidesPerView={1}
      // loop={displayImages.length > 1}
      loop
      pagination={{
        clickable: true,
      }}
      onBeforeInit={(swiper: any) => {
        if (
          typeof swiper.params.navigation !== "boolean" &&
          swiper.params.navigation
        ) {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }
      }}
      className="h-full w-full"
    >
      {displayImages.map((img, index) => (
        <SwiperSlide key={index}>
          <Link
            href={`/productDetails/${productId}`}
            className="block w-full h-full"
          >
            <div className="relative w-full h-full">
              <Image
                src={img === placeholderSrc ? placeholderSrc : getImageUrl(img)}
                alt={productTitle}
                fill
                priority={priority && index === 0}
                loading={priority && index === 0 ? "eager" : "lazy"}
                quality={75}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-top transition-all duration-500"
              />
            </div>
          </Link>
        </SwiperSlide>
      ))}

      {/* PREV BUTTON */}
      {displayImages.length > 1 && (
        <button
          ref={prevRef}
          className="absolute left-3 top-1/2 z-30 hidden md:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg border border-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
      )}

      {/* NEXT BUTTON */}
      {displayImages.length > 1 && (
        <button
          ref={nextRef}
          className="absolute right-3 top-1/2 z-30 hidden md:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg border border-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={2} />
        </button>
      )}
    </Swiper>
  );
}
