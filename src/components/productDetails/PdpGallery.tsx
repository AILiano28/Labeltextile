"use client";

import Image from "next/image";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

interface PdpGalleryProps {
  images: string[];
  imageUrl: (src: string) => string;
  title: string;
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

// Index of the slide in view; scrollLeft is negative in RTL, so use its magnitude.
const indexFromScroll = (el: HTMLElement) => (el.clientWidth ? Math.round(Math.abs(el.scrollLeft) / el.clientWidth) : 0);

/**
 * Product gallery: the backend photos in their order, whole (object-contain) in a 3:4 frame,
 * swipe with scroll snapping, a counter, a thin progress line and thumbnails, all kept in sync.
 * Tapping a photo opens a full-screen viewer with zoom.
 * Selecting a color still moves it through `selectedImageIndex`.
 */
export default function PdpGallery({
  images,
  imageUrl,
  title,
  selectedImageIndex,
  setSelectedImageIndex,
}: PdpGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const fromScroll = useRef(false);
  // Open viewer: start photo, and the page wrapper it renders into (read in the click handler, not during render).
  const [viewer, setViewer] = useState<{ index: number; host: Element } | null>(null);
  const openViewer = (index: number) =>
    setViewer({ index, host: trackRef.current?.closest(".pdp-root") ?? document.body });
  const count = images.length;

  // Keep the track and the active thumbnail in view when the index changes from outside
  // (thumbnails, color choice, closing the viewer).
  useEffect(() => {
    const thumbs = thumbsRef.current;
    const thumb = thumbs?.children[selectedImageIndex] as HTMLElement | undefined;
    if (thumbs && thumb) {
      // Scroll the thumbnail row only (scrollIntoView would also move the page).
      const t = thumb.getBoundingClientRect(), r = thumbs.getBoundingClientRect();
      if (t.left < r.left || t.right > r.right) thumbs.scrollBy({ left: t.left - r.left - (r.width - t.width) / 2, behavior: "smooth" });
    }
    if (fromScroll.current) {
      fromScroll.current = false;
      return;
    }
    const track = trackRef.current;
    // RTL: slide i sits at scrollLeft = -i × width.
    if (track) track.scrollTo({ left: -selectedImageIndex * track.clientWidth, behavior: "smooth" });
  }, [selectedImageIndex]);

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const index = Math.min(indexFromScroll(el), count - 1);
    if (index !== selectedImageIndex) {
      fromScroll.current = true;
      setSelectedImageIndex(index);
    }
  };

  // In RTL, ArrowLeft moves forward.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" && selectedImageIndex < count - 1) {
      e.preventDefault();
      setSelectedImageIndex(selectedImageIndex + 1);
    } else if (e.key === "ArrowRight" && selectedImageIndex > 0) {
      e.preventDefault();
      setSelectedImageIndex(selectedImageIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      openViewer(selectedImageIndex);
    }
  };

  const closeViewer = useCallback(
    (lastIndex: number) => {
      setViewer(null);
      if (lastIndex !== selectedImageIndex) setSelectedImageIndex(lastIndex);
    },
    [selectedImageIndex, setSelectedImageIndex]
  );

  if (count === 0) return null;

  return (
    <section aria-label="صور المنتج" aria-roledescription="معرض صور" className="w-full min-w-0">
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label="اسحبي لعرض الصور، واضغطي على الصورة لتكبيرها"
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain bg-lt-sand [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-lt-espresso"
        >
          {images.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              tabIndex={-1}
              onClick={() => openViewer(index)}
              aria-roledescription="شريحة"
              aria-label={`تكبير الصورة ${index + 1} من ${count}`}
              className="relative aspect-[3/4] w-full shrink-0 cursor-zoom-in snap-start snap-always"
            >
              <Image
                src={imageUrl(img)}
                alt={`${title}، الصورة ${index + 1}`}
                fill
                quality={75}
                priority={index === 0}
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-contain select-none"
                draggable={false}
              />
            </button>
          ))}
        </div>

        {count > 1 && (
          <p
            dir="ltr"
            aria-live="polite"
            className="pointer-events-none absolute bottom-3 left-3 bg-lt-ivory/85 px-2 py-0.5 text-[13px] tracking-[0.08em] tabular-nums text-lt-espresso"
          >
            {pad(selectedImageIndex + 1)} / {pad(count)}
          </p>
        )}
      </div>

      {count > 1 && (
        <>
          {/* Progress: a thin line under the photo, filled up to the current image (from the right in RTL). */}
          <div aria-hidden className="h-[2px] bg-lt-line">
            <div
              className="h-full bg-lt-espresso transition-[width] duration-200 ease-out"
              style={{ width: `${((selectedImageIndex + 1) / count) * 100}%` }}
            />
          </div>

          <div
            ref={thumbsRef}
            className="flex gap-2 overflow-x-auto px-4 pt-3 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, index) => {
              const active = index === selectedImageIndex;
              return (
                <button
                  key={`thumb-${img}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`عرض الصورة ${index + 1}`}
                  aria-current={active}
                  className={`relative aspect-[3/4] w-14 shrink-0 overflow-hidden border-[1.5px] bg-lt-sand ${
                    active ? "border-lt-espresso" : "border-transparent"
                  }`}
                >
                  <Image src={imageUrl(img)} alt="" fill sizes="56px" quality={75} className="object-cover" />
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Rendered at the page wrapper: the desktop gallery column is sticky, which would trap the viewer below the navbar. */}
      {viewer &&
        createPortal(
          <ZoomViewer images={images} imageUrl={imageUrl} title={title} startIndex={viewer.index} onClose={closeViewer} />,
          viewer.host
        )}
    </section>
  );
}

// ─── Full-screen viewer ───────────────────────────────────────────────────────

function ZoomViewer({
  images,
  imageUrl,
  title,
  startIndex,
  onClose,
}: {
  images: string[];
  imageUrl: (src: string) => string;
  title: string;
  startIndex: number;
  onClose: (lastIndex: number) => void;
}) {
  const count = images.length;
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const zoomRef = useRef<HTMLButtonElement>(null);
  // Point (0–1 on each axis) to centre on once the 2× canvas has rendered.
  const focal = useRef<{ x: number; y: number } | null>(null);

  // Open on the tapped photo, lock page scroll, focus the close button; restore focus on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const track = trackRef.current;
    track?.scrollTo({ left: -startIndex * track.clientWidth });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, [startIndex]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track || i < 0 || i >= count) return;
    setZoomed(false);
    setIndex(i);
    track.scrollTo({ left: -i * track.clientWidth, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el || zoomed) return;
    setIndex(Math.min(indexFromScroll(el), count - 1));
  };

  // Zoom toward the tapped point: the current slide becomes a scrollable 2× canvas.
  const toggleZoom = (e?: MouseEvent<HTMLDivElement>) => {
    const pane = trackRef.current?.children[index] as HTMLElement | undefined;
    if (!pane) return;
    if (zoomed) {
      setZoomed(false);
      return;
    }
    const rect = (pane.firstElementChild as HTMLElement).getBoundingClientRect();
    focal.current = e
      ? {
          x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
          y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)),
        }
      : { x: 0.5, y: 0.5 };
    setZoomed(true);
  };

  // After the 2× canvas renders, scroll it so the tapped point is centred.
  useLayoutEffect(() => {
    const pane = trackRef.current?.children[index] as HTMLElement | undefined;
    if (!zoomed || !pane || !focal.current) return;
    // The pane is LTR, so its scroll offsets are plain positive values.
    pane.scrollTo({
      left: focal.current.x * pane.scrollWidth - pane.clientWidth / 2,
      top: focal.current.y * pane.scrollHeight - pane.clientHeight / 2,
    });
    focal.current = null;
  }, [zoomed, index]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose(index);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "Tab") {
      // Keep focus inside the dialog (two controls).
      e.preventDefault();
      (document.activeElement === closeRef.current ? zoomRef.current : closeRef.current)?.focus();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`صور ${title}`}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[300] flex flex-col bg-lt-ivory text-lt-espresso"
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-2 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center">
          <button
            ref={closeRef}
            type="button"
            onClick={() => onClose(index)}
            aria-label="إغلاق"
            className="flex size-11 items-center justify-center"
          >
            <X size={24} aria-hidden />
          </button>
          <button
            ref={zoomRef}
            type="button"
            onClick={() => toggleZoom()}
            aria-label={zoomed ? "تصغير الصورة" : "تكبير الصورة"}
            aria-pressed={zoomed}
            className="flex size-11 items-center justify-center"
          >
            {zoomed ? <ZoomOut size={21} aria-hidden /> : <ZoomIn size={21} aria-hidden />}
          </button>
        </div>
        <p dir="ltr" aria-live="polite" className="px-3 text-[13px] tracking-[0.08em] tabular-nums">
          {pad(index + 1)} / {pad(count)}
        </p>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className={`flex min-h-0 flex-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          zoomed ? "overflow-hidden" : "overflow-x-auto overscroll-x-contain"
        }`}
      >
        {images.map((img, i) => {
          const isZoomed = zoomed && i === index;
          return (
            <div
              key={`viewer-${img}-${i}`}
              dir="ltr"
              onClick={i === index ? toggleZoom : undefined}
              className={`h-full w-full shrink-0 snap-start snap-always ${
                isZoomed ? "cursor-zoom-out overflow-auto overscroll-contain" : "cursor-zoom-in overflow-hidden px-4 py-3 md:px-10 md:py-6"
              }`}
            >
              <div className={`relative ${isZoomed ? "h-[200%] w-[200%]" : "h-full w-full"}`}>
                <Image
                  src={imageUrl(img)}
                  alt={`${title}، الصورة ${i + 1}`}
                  fill
                  quality={75}
                  loading={Math.abs(i - index) <= 1 ? "eager" : "lazy"}
                  sizes={isZoomed ? "200vw" : "100vw"}
                  className="object-contain select-none"
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="shrink-0 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] text-center text-[13px] text-lt-muted">
        {zoomed ? "اسحبي لتحريك الصورة، واضغطي للتصغير" : "اضغطي على الصورة للتكبير"}
      </p>
    </div>
  );
}
