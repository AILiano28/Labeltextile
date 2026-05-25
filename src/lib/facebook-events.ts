export const FB_EVENTS = {
  PAGE_VIEW: "PageView",
  VIEW_CATEGORY: "ViewCategory",
  INITIATE_CHECKOUT: "InitiateCheckout",
  PURCHASE: "Purchase",
} as const;

export type FacebookEventName =
  (typeof FB_EVENTS)[keyof typeof FB_EVENTS];
