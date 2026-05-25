"use client";

import { useEffect } from "react";

import { FB_EVENTS, trackFacebookEvent } from "@/lib/facebook";

type FacebookCategoryTrackerProps = {
  categoryId?: string | number;
  categoryName: string;
  productIds?: Array<string | number>;
};

export default function FacebookCategoryTracker({
  categoryId,
  categoryName,
  productIds = [],
}: FacebookCategoryTrackerProps) {
  const productIdKey = productIds.join(",");

  useEffect(() => {
    const contentIds = productIdKey ? productIdKey.split(",") : [];

    void trackFacebookEvent(FB_EVENTS.VIEW_CATEGORY, {
      contentIds,
      contentCategory: categoryName,
      contentName: categoryName,
      contentType: "product_group",
      numItems: contentIds.length || undefined,
    });
  }, [categoryId, categoryName, productIdKey]);

  return null;
}
