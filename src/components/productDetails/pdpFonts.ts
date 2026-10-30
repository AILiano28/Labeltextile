import { IBM_Plex_Sans_Arabic, Noto_Naskh_Arabic } from "next/font/google";

// Arabic faces for the product page (Poppins has no Arabic glyphs).
// Applied through the .pdp-root rules in globals.css, which outrank the site-wide Poppins rule.
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-pdp-sans",
  // Not preloaded: font preloads competed with the main product photo on slow 4G (perf audit 28 Oct 2026).
  // The font still loads from the CSS straight away and swaps in.
  preload: false,
});
export const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-pdp-display",
  // Headings only: not preloaded, so it doesn't compete with the hero photo (it still loads, then swaps in).
  preload: false,
  // No metric-adjusted serif fallback: Latin titles fall through to IBM Plex instead.
  adjustFontFallback: false,
  fallback: [],
});
