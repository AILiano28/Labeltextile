"use client";

export default function ContactForm() {
  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <input
            type="text"
            placeholder="اسم"
            className="w-full h-[60px] px-6 bg-transparent border border-[#E6E6E6] text-black focus:outline-none focus:border-primary-900 transition-colors placeholder:text-neutral-400 text-right"
          />
        </div>
        <div className="relative">
          <input
            placeholder="بريد إلكتروني"
            className="w-full h-[60px] px-6 bg-transparent border border-[#E6E6E6] text-black focus:outline-none focus:border-primary-900 transition-colors placeholder:text-neutral-400 text-right"
          />
        </div>
      </div>
      <div className="relative">
        <textarea
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
