"use client";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300"],
  // Not preloaded: font preloads competed with the main product photo on slow 4G (perf audit 28 Oct 2026).
  // The font still loads from the CSS straight away and swaps in.
  preload: false,
});

export default function LuxuryLogo() {
  return (
    <div
      className={`
        ${montserrat.className}
        flex
        flex-col
        items-center
        justify-center
        select-none
        leading-none
      `}
    >
      {/* Main Logo Text */}
      <h1
        className="
          uppercase
          font-extralight
          text-black
          whitespace-nowrap
          
          text-[24px]
          sm:text-[34px]
          md:text-[52px]
          lg:text-[64px]

          tracking-[10px]
          sm:tracking-[14px]
          md:tracking-[18px]
          lg:tracking-[22px]
        "
      >
        LABELTEXTILE
      </h1>

      {/* Bottom Section */}
      <div
        className="
          flex
          items-center
          justify-center

          gap-3
          sm:gap-5
          md:gap-6

          mt-3
          md:mt-5
        "
      >
        {/* Left Line */}
        <div
          className="
            h-[1px]
            bg-black/40

            w-8
            sm:w-12
            md:w-16
          "
        />

        {/* Algeria Text */}
        <span
          className="
            uppercase
            text-black/70
            font-light

            text-[10px]
            sm:text-[10px]
            md:text-[13px]

            tracking-[4px]
            sm:tracking-[6px]
            md:tracking-[10px]
          "
        >
          ALGERIE
        </span>

        {/* Right Line */}
        <div
          className="
            h-[1px]
            bg-black/40

            w-8
            sm:w-12
            md:w-16
          "
        />
      </div>
    </div>
  );
}