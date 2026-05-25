import { FB_EVENTS, FacebookEventName } from "./facebook-events";

type ContentItem = {
  id: string;
  quantity: number;
  item_price?: number;
};

export type FacebookEventData = {
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  contentType?: string;
  contents?: ContentItem[];
  numItems?: number;
  orderId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
};

type TrackFacebookEventParams = FacebookEventData & {
  eventName: FacebookEventName;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    fbTrack?: (eventName: FacebookEventName, data?: FacebookEventData) => void;
  }
}

function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function cleanPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );
}

function createEventId(eventName: FacebookEventName) {
  return `${eventName}.${Date.now()}.${crypto.randomUUID()}`;
}

async function sendFacebookEvent(
  eventName: FacebookEventName,
  data: FacebookEventData = {}
) {
  if (typeof window === "undefined") return false;

  const eventId = createEventId(eventName);
  const hasCommerceData =
    data.value !== undefined ||
    data.contentIds?.length ||
    data.contents?.length ||
    data.numItems !== undefined;
  const currency = data.currency || (hasCommerceData ? "DZD" : undefined);
  const contentType =
    data.contentType || (data.contentIds?.length || data.contents?.length ? "product" : undefined);

  const pixelData = cleanPayload({
    value: data.value,
    currency,
    content_ids: data.contentIds,
    content_name: data.contentName,
    content_type: contentType,
    contents: data.contents,
    num_items: data.numItems,
    order_id: data.orderId,
  });

  window.fbq?.("track", eventName, pixelData, { eventID: eventId });

  try {
    const response = await fetch("/api/facebook", {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        cleanPayload({
          eventName,
          eventId,
          eventSourceUrl: window.location.href,
          ...data,
          currency,
          contentType,
          fbc: getCookie("_fbc"),
          fbp: getCookie("_fbp"),
        })
      ),
    });

    return response.ok;
  } catch (error) {
    console.error("Facebook tracking failed", error);
    return false;
  }
}

export function trackFacebookEvent(
  eventName: FacebookEventName,
  data?: FacebookEventData
): Promise<boolean>;
export function trackFacebookEvent(
  params: TrackFacebookEventParams
): Promise<boolean>;
export function trackFacebookEvent(
  eventOrParams: FacebookEventName | TrackFacebookEventParams,
  data: FacebookEventData = {}
) {
  if (typeof eventOrParams === "string") {
    return sendFacebookEvent(eventOrParams, data);
  }

  const { eventName, ...eventData } = eventOrParams;
  return sendFacebookEvent(eventName, eventData);
}

export function initGlobalFacebookTracker() {
  if (typeof window === "undefined") return;

  window.fbTrack = (eventName, data = {}) => {
    void trackFacebookEvent(eventName, data);
  };
}

export { FB_EVENTS };
export type { FacebookEventName };
