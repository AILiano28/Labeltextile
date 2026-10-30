"use client";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300"],
  // Not preloaded: font preloads competed with the main product photo on slow 4G (perf audit 28 Oct 2026).
  // The font still loads from the CSS straight away and swaps in.
  preload: false,
});

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

import { Category } from "@/types/api";
import { api } from "@/lib/api";
import LuxuryLogo from "./LuxuryLogo";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories for navbar:", err);
      }
    };
    fetchCats();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "#", label: "مجموعاتنا", isDropdown: true },
    { href: "/contact", label: "اتصل بنا" },
    { href: "/about", label: "من نحن" },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300"
        dir="rtl"
        style={{
          backgroundColor: scrolled
            ? "rgba(255, 255, 255, 0.4)"
            : "rgba(255, 255, 255, 0.4)",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow:
            scrolled && !mobileMenuOpen
              ? "0 4px 20px rgba(0,0,0,0.05)"
              : "none",
        }}
      >
        <div className="container mx-auto px-6 lg:px-10">
          {/* Logo row — slides up and fades out on scroll */}
          <div
            className={`hidden md:flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${scrolled ? "max-h-0 opacity-0 py-0" : "max-h-[70px] opacity-100 py-3"
              }`}
          >
            {/* Logo */}
            <div className="flex justify-center pt-1 ">
              <div
                className={` ${montserrat.className} flex flex-col items-center justify-center leading-none select-none `}
              >
                {/* Main Text */}
                <h1
                  className="uppercase font-extralight text-black whitespace-nowrap text-[20px]     tracking-[12px] md:tracking-[18px]  lg:tracking-[24px]  xl:tracking-[30px]"
                >
                  LABELTEXTILE
                </h1>

                {/* Bottom Section */}
                <div
                  className="
        flex
        items-center
        justify-center
        gap-5
        mt-4
      "
                >
                  <div className="w-14 h-[1px] bg-black/40" />

                  <span
                    className="          uppercase
          text-black/70
          font-light

          text-[10px]
          md:text-[12px]

          tracking-[8px]
        "
                  >
                    ALGERIE
                  </span>

                  <div className="w-14 h-[1px] bg-black/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile header row (logo always centered, hamburger on left) */}
          <div className="flex md:hidden h-[70px] items-center justify-between relative">
            <button
              className="flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-black" strokeWidth={1.5} />
              ) : (
                <Menu className="h-6 w-6 text-black" strokeWidth={1.5} />
              )}
            </button>

            {/* Mobile Logo — always visible */}
            <LuxuryLogo />

            <div className="w-6" /> {/* Spacer to balance hamburger */}
          </div>
        </div>

        {/* Desktop Navigation links row */}
        <nav className="hidden md:block">
          <div className="container mx-auto px-6 lg:px-10">
            <ul
              className={`flex items-center justify-center gap-12 transition-all duration-300 ${scrolled ? "h-[60px]" : "h-[48px]"
                }`}
            >
              {navLinks.map((link) => (
                <li
                  key={link.label}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => link.isDropdown && setIsHovered(true)}
                  onMouseLeave={() => link.isDropdown && setIsHovered(false)}
                >
                  {link.isDropdown ? (
                    <div className="flex items-center gap-1 cursor-default text-[16px] font-medium text-black">
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${isHovered ? "rotate-180" : ""
                          }`}
                      />

                      {isHovered && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white border border-black/5 shadow-2xl rounded-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/cataProducts/${cat.id}/${encodeURIComponent(
                                cat.name
                              )}`}
                              className="block px-6 py-3 text-[15px] text-black/70 hover:bg-black/5 hover:text-black transition-all"
                              onClick={() => setIsHovered(false)}
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-[16px] font-medium text-black transition-all duration-200 hover:text-black/60 relative group"
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-full" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation overlay */}
      {mobileMenuOpen && (
        <nav
          className="fixed inset-0 z-[100] bg-[#DED1C1] md:hidden overflow-y-auto"
          dir="rtl"
        >
          <div className="flex flex-col min-h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 h-[90px] border-b border-black/5 bg-[#DED1C1] sticky top-0 z-10">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2"
                aria-label="Close menu"
              >
                <X className="h-7 w-7 text-black/70" strokeWidth={1.5} />
              </button>

            <LuxuryLogo />

              <div className="w-11" />
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col px-6 py-8">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="border-b border-black/5 last:border-0"
                >
                  {link.isDropdown ? (
                    <div className="py-6 flex flex-col">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() =>
                          setIsMobileCategoryOpen(!isMobileCategoryOpen)
                        }
                      >
                        <span className="text-[18px] font-medium text-black/80 uppercase tracking-[2px]">
                          {link.label}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-black/40 transition-transform duration-300 ${isMobileCategoryOpen ? "rotate-180" : ""
                            }`}
                        />
                      </div>
                      <div
                        className={`overflow-hidden bg-black/5 rounded-xl transition-all duration-300 ${isMobileCategoryOpen
                          ? "mt-4 max-h-96 opacity-100"
                          : "mt-0 max-h-0 opacity-0"
                          }`}
                      >
                        <div className="p-6 flex flex-col gap-6">
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/cataProducts/${cat.id}/${encodeURIComponent(
                                cat.name
                              )}`}
                              className="text-[16px] text-black/70 font-medium hover:text-black transition-colors"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setIsMobileCategoryOpen(false);
                              }}
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className="block py-8 text-[18px] font-medium text-black/80 uppercase tracking-[2px] hover:text-black transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Footer info in menu */}
            <div className="mt-auto px-6 py-10 flex flex-col items-center border-t border-black/5">
              <span className="text-[10px] tracking-[6px] text-black/30 font-bold uppercase mb-2">
                Qualité Algérienne
              </span>
              <div className="h-0.5 w-10 bg-black/10 rounded-full" />
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;