"use client";

import { useMemo, useState } from "react";
import { Review } from "@/types/api";
import { Star, X } from "lucide-react";
import { AddReviewForm } from "./AddReviewForm";
import { api } from "@/lib/api";
import { reviewCountLabel } from "./reviewCount";

interface ProductReviewsProps {
  initialReviews: Review[];
  productId: number;
}

const FIRST_VISIBLE = 3;

// Some reviews were saved with a phone number as the name: never show it publicly.
const displayName = (name: string) => ((name.match(/\d/g) ?? []).length >= 6 ? "عميلة" : name);

function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} من 5`} role="img">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={size}
          aria-hidden
          fill={i < Math.round(value) ? "#A78D77" : "transparent"}
          className={i < Math.round(value) ? "text-lt-taupe" : "text-lt-line"}
        />
      ))}
    </span>
  );
}

/**
 * Approved reviews from the backend, each shown once, newest first. With none: a short
 * invitation and the existing add-review form (same API; new reviews appear once approved).
 */
export function ProductReviews({ initialReviews, productId }: ProductReviewsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(
    () => [...reviews].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    [reviews]
  );
  const count = sorted.length;
  const average = count ? sorted.reduce((s, r) => s + Number(r.rating || 0), 0) / count : 0;
  const visible = showAll ? sorted : sorted.slice(0, FIRST_VISIBLE);

  const handleRefresh = async () => {
    try {
      const data = await api.filterReviews({ approved: true, productId });
      setReviews(data);
    } catch (error) {
      console.warn("Reviews unavailable:", error);
    }
  };

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-24 text-right text-lt-espresso">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="reviews-title" className="pdp-display text-[22px] font-semibold leading-[1.4]">
            آراء العميلات
          </h2>
          {count > 0 && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-lt-desc">
              <Stars value={average} />
              <span className="font-semibold tabular-nums text-lt-espresso">{average.toFixed(1)}</span>
              <span>· {reviewCountLabel(count)}</span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex min-h-11 shrink-0 items-center rounded-[4px] border border-lt-espresso px-4 text-[14px] font-medium text-lt-espresso transition-colors hover:bg-lt-espresso hover:text-lt-ivory"
        >
          أضيفي رأيك
        </button>
      </div>

      {count === 0 ? (
        <p className="mt-4 text-[15px] leading-[1.75] text-lt-desc">لا توجد مراجعات بعد. كوني أول من تقيّم هذا المنتج.</p>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-lt-line border-y border-lt-line">
            {visible.map((r) => (
              <li key={r.id} className="py-4">
                <Stars value={Number(r.rating || 0)} size={14} />
                {r.comment && (
                  <p dir="auto" className="mt-2 text-right text-[15px] leading-[1.75] text-lt-espresso">
                    {r.comment}
                  </p>
                )}
                <p dir="auto" className="mt-1.5 text-right text-[13.5px] font-medium text-lt-desc">
                  {displayName(String(r.name ?? ""))}
                </p>
              </li>
            ))}
          </ul>
          {count > FIRST_VISIBLE && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="mt-2 inline-flex min-h-11 items-center text-[14px] text-lt-espresso underline decoration-lt-taupe underline-offset-[6px]"
            >
              {showAll ? "عرض أقل" : `عرض كل المراجعات (${count})`}
            </button>
          )}
        </>
      )}

      {/* Add-review form (unchanged behaviour and API). */}
      {isModalOpen && (
        <>
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          />
          <div className="fixed top-1/2 left-1/2 z-[101] w-[95%] max-w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[12px] bg-white shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200">
            <div className="relative p-6 md:p-8">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="إغلاق"
                className="absolute top-3 left-3 flex size-11 items-center justify-center rounded-full text-black/40 transition-colors hover:bg-black/5 hover:text-black"
              >
                <X size={20} />
              </button>

              <AddReviewForm
                productId={productId}
                onSuccess={() => {
                  setIsModalOpen(false);
                  handleRefresh();
                }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
