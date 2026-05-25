export const FB_EVENTS = {
  PAGE_VIEW: "PageView",
  VIEW_CONTENT: "ViewContent",
  ADD_TO_CART: "AddToCart",
  INITIATE_CHECKOUT: "InitiateCheckout",
  PURCHASE: "Purchase",
  LEAD: "Lead",
} as const;

export type FacebookEventName =
  (typeof FB_EVENTS)[keyof typeof FB_EVENTS];