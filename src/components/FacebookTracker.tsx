"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FB_EVENTS,
  type FacebookEventName,
  initGlobalFacebookTracker,
  trackFacebookEvent,
} from "@/lib/facebook";

function FacebookTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initGlobalFacebookTracker();
  }, []);

  useEffect(() => {
    trackFacebookEvent(FB_EVENTS.PAGE_VIEW);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const addToCart = target.closest("[data-fb-event='AddToCart']");
      const checkout = target.closest("[data-fb-event='InitiateCheckout']");
      const lead = target.closest("[data-fb-event='Lead']");

      const element = addToCart || checkout || lead;
      if (!element) return;

      const eventName = element.getAttribute("data-fb-event");
      if (!isFacebookEventName(eventName)) return;

      trackFacebookEvent(eventName, {
        value: Number(element.getAttribute("data-fb-value")) || undefined,
        currency: element.getAttribute("data-fb-currency") || "DZD",
        contentIds: element.getAttribute("data-fb-content-id")
          ? [String(element.getAttribute("data-fb-content-id"))]
          : undefined,
        contentName: element.getAttribute("data-fb-content-name") || undefined,
        numItems: Number(element.getAttribute("data-fb-num-items")) || undefined,
      });
    };

    document.addEventListener("click", handleClick);

    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

export default function FacebookTracker() {
  return (
    <Suspense fallback={null}>
      <FacebookTrackerInner />
    </Suspense>
  );
}

function isFacebookEventName(value: string | null): value is FacebookEventName {
  return Object.values(FB_EVENTS).some((eventName) => eventName === value);
}
