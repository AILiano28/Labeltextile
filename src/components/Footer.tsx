import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden font-poppins">
      {/* Background gradient — unchanged */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#C7B7A7] to-[#F2F2F2]" />

      {/* ── Main Footer Content ── */}
      <div className="relative z-10 container mx-auto px-6 lg:px-10 pt-14 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* ── Right Column: Brand + Description + Contact (spans 5 cols) ── */}
          <div className="md:col-span-5 space-y-6">
            {/* Logo + Brand Name */}
            <div className="flex items-center gap-4">
              <Image
                src="/assets/logo.avif"
                alt="Label Textile Logo"
                width={65}
                height={70}
                quality={75}
                loading="lazy"
                className="object-contain"
                style={{ height: "auto" }}
              />
              <div className="flex flex-col items-start">
                <span
                  className="font-semibold text-black tracking-wide leading-tight"
                  style={{ fontSize: "20px" }}
                >
                  LABEL TEXTILE
                </span>
                <span
                  className="text-black/70 leading-tight"
                  style={{ fontSize: "13px" }}
                >
                  Manufactured in ALGERIA
                </span>
              </div>
            </div>

            {/* Description */}
            <p
              className="text-black leading-relaxed max-w-md"
              style={{ fontSize: "16px" }}
            >
              لیبل تیكستايل هي علامة ملابس مقرها في الجزائر، مختصة في تصميم
              أزياء نسائية أنيقة ومريحة. نركز على الجودة في التصنيع، والتصميم
              العصري والاهتمام بأدق التفاصيل لنقدم ملابس تجمع بين الأناقة
              والراحة للاستعمال اليومي
            </p>

            {/* Contact Info */}
            <ul className="space-y-3 font-medium">
              <li className="flex items-center gap-3">
                <Phone
                  className="h-[16px] w-[16px] text-black shrink-0"
                  strokeWidth={1.5}
                />
                <span className="text-black" style={{ fontSize: "16px" }}>
                  0776506113
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail
                  className="h-[16px] w-[16px] text-black shrink-0"
                  strokeWidth={1.5}
                />
                <span className="text-black" style={{ fontSize: "16px" }}>
                  Contact@labeltextile.com
                </span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin
                  className="h-[16px] w-[16px] text-black shrink-0"
                  strokeWidth={1.5}
                />
                <span className="text-black" style={{ fontSize: "16px" }}>
                  دالي إبراهيم، عين الله، الجزائر
                </span>
              </li>
            </ul>
          </div>

          {/* ── Middle Column: المتجر (Shop) (spans 3 cols) ── */}
          <div className="md:col-span-3">
            <h3
              className="font-semibold text-black mb-5"
              style={{ fontSize: "20px" }}
            >
              المتجر
            </h3>
            <ul className="space-y-3">
              {["الرئيسية", "مجموعاتنا", "اتصل بنا", "من نحن"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-black font-medium hover:text-primary-900 transition-colors duration-200"
                    style={{ fontSize: "16px" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Left Column: خدمة العملاء (Customer Service) (spans 3 cols) ── */}
          <div className="md:col-span-3">
            <h3
              className="font-semibold text-black mb-5"
              style={{ fontSize: "20px" }}
            >
              خدمة العملاء
            </h3>
            <ul className="space-y-3">
              {[
                "الشحن والإرجاع",
                "جدول المقاسات",
                "الأسئلة الشائعة",
                "اتصل بنا",
                "من نحن",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-black font-medium hover:text-primary-900 transition-colors duration-200"
                    style={{ fontSize: "16px" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empty spacer for remaining 1 col */}
          <div className="md:col-span-1" />
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-10 pt-5 border-t border-[#666666] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link
              href="/privacy-policy"
              className="text-black hover:text-primary-900 transition-colors duration-200"
              style={{ fontSize: "16px" }}
            >
              سياسة الخصوصية
            </Link>
            <Link
              href="/terms"
              className="text-black hover:text-primary-900 transition-colors duration-200"
              style={{ fontSize: "16px" }}
            >
              الشروط والأحكام
            </Link>
          </div>

          <p className="text-black" style={{ fontSize: "16px" }}>
            {new Date().getFullYear()} LabelTextile. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
