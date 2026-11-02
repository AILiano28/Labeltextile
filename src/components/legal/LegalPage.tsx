import React from "react";

// Shared layout for the legal pages (/privacy-policy, /terms): Arabic, right-to-left, plain text.
// The top padding clears the fixed navbar.
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="w-full px-6 pt-[110px] pb-16 md:pt-[170px] md:pb-24 lg:px-10" dir="rtl">
      <article className="mx-auto max-w-3xl text-right text-black">
        <h1 className="text-[32px] font-semibold leading-tight md:text-[48px]">{title}</h1>
        <p className="mt-3 text-[14px] text-black/60">آخر تحديث: {updated}</p>
        <div className="mt-10 space-y-10 text-[16px] leading-[1.9] text-black/80">{children}</div>
      </article>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-[20px] font-semibold text-black md:text-[22px]">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pr-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
