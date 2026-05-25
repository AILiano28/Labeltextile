"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FB_EVENTS,
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

  return null;
}

export default function FacebookTracker() {
  return (
    <Suspense fallback={null}>
      <FacebookTrackerInner />
    </Suspense>
  );
}
