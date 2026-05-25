import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FacebookTracker from "@/components/FacebookTracker";

import "./globals.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LABEL Textile",
  description:
    "Experience the perfect blend of elegance and modesty with label textile collections.",
};

const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://back.testwebapp.space" />
        <link rel="dns-prefetch" href="https://back.testwebapp.space" />
      </head>

      <body className="font-poppins min-h-full flex flex-col">
        <Navbar />

        <div className="bg-[#F2F2F2] flex-1">{children}</div>

        <Footer />

        {pixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;
    n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;
    n.push=n;
    n.loaded=!0;
    n.version='2.0';
    n.queue=[];
    t=b.createElement(e);
    t.async=!0;
    t.src=v;
    s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}
    (window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', '${pixelId}');
  `}
          </Script>
        )}

        {pixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
        <FacebookTracker />
      </body>
    </html>
  );
}
