"use client";

import { FormEvent } from "react";

import { FB_EVENTS, trackFacebookEvent } from "@/lib/facebook";

export default function ContactForm() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    void trackFacebookEvent(FB_EVENTS.LEAD, {
      email: String(formData.get("email") || ""),
      firstName: String(formData.get("name") || ""),
      contentName: "Contact form",
      contentType: "lead",
    });

    event.currentTarget.reset();
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <input
            type="text"
            name="name"
            placeholder="اسم"
            className="w-full h-[60px] px-6 bg-transparent border border-[#E6E6E6] text-black focus:outline-none focus:border-primary-900 transition-colors placeholder:text-neutral-400 text-right"
          />
        </div>
        <div className="relative">
          <input
            type="email"
            name="email"
            placeholder="بريد إلكتروني"
            className="w-full h-[60px] px-6 bg-transparent border border-[#E6E6E6] text-black focus:outline-none focus:border-primary-900 transition-colors placeholder:text-neutral-400 text-right"
          />
        </div>
      </div>
      <div className="relative">
        <textarea
          name="message"
          placeholder="رسالة"
          rows={6}
          className="w-full px-6 py-4 bg-transparent border border-[#E6E6E6] text-black focus:outline-none focus:border-primary-900 transition-colors placeholder:text-neutral-400 text-right resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full h-14 bg-[#B3A495] hover:bg-[#a39485] text-white text-[18px] font-medium rounded-[2px] transition-all disabled:opacity-50"
      >
        تقديم
      </button>
    </form>
  );
}
