"use client";

import { useEffect } from "react";

/** Switches on the product-page web fonts once React has hydrated (see pdp.css). */
export default function PdpFontsGate() {
  useEffect(() => {
    document.documentElement.setAttribute("data-pdp-fonts", "");
  }, []);
  return null;
}

/** Fallbacks rendered with the page: start the fonts after 5 s even if hydration is slow or fails,
    and right away when JavaScript is off. */
export const PDP_FONTS_TIMER = `setTimeout(function(){document.documentElement.setAttribute("data-pdp-fonts","")},5000)`;
export const PDP_FONTS_NOSCRIPT = `.pdp-root,.pdp-root *{font-family:var(--font-pdp-sans),sans-serif!important}.pdp-root .pdp-display{font-family:var(--font-pdp-display),var(--font-pdp-sans),serif!important}`;
