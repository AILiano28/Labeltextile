import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_API_VERSION = process.env.FACEBOOK_GRAPH_API_VERSION || "v23.0";
const FACEBOOK_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
  "Lead",
]);

type ContentItem = {
  id: string;
  quantity: number;
  item_price?: number;
};

type FacebookPayload = {
  eventName?: string;
  eventId?: string;
  eventSourceUrl?: string;
  actionSource?: string;
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
  fbc?: string;
  fbp?: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function cleanString(value?: string) {
  const normalized = value?.trim().toLowerCase();
  return normalized || undefined;
}

function cleanPhone(value?: string) {
  const normalized = value?.replace(/[^\d]/g, "");
  return normalized || undefined;
}

function hashed(value?: string) {
  const normalized = cleanString(value);
  if (!normalized) return undefined;
  return /^[a-f0-9]{64}$/i.test(normalized) ? normalized : sha256(normalized);
}

function hashedPhone(value?: string) {
  const normalized = cleanPhone(value);
  return normalized ? sha256(normalized) : undefined;
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
  return (
    forwardedFor?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    undefined
  );
}

function compact<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null || entry === "") return false;
      if (Array.isArray(entry) && entry.length === 0) return false;
      return true;
    })
  );
}

export async function POST(request: NextRequest) {
  const pixelId = process.env.FACEBOOK_PIXEL_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return NextResponse.json(
      { error: "Facebook CAPI is not configured" },
      { status: 500 }
    );
  }

  const body = (await request.json()) as FacebookPayload;

  if (!body.eventName || !FACEBOOK_EVENTS.has(body.eventName)) {
    return NextResponse.json(
      { error: "Unsupported Facebook event" },
      { status: 400 }
    );
  }

  const hasCustomData =
    body.value !== undefined ||
    body.contentIds?.length ||
    body.contentName ||
    body.contents?.length ||
    body.numItems !== undefined ||
    body.orderId;

  const customData = compact({
    value: body.value,
    currency: body.currency || (hasCustomData ? "DZD" : undefined),
    content_ids: body.contentIds,
    content_name: body.contentName,
    content_type: body.contentType || (body.contentIds?.length ? "product" : undefined),
    contents: body.contents,
    num_items: body.numItems,
    order_id: body.orderId,
  });

  const userData = compact({
    em: hashed(body.email),
    ph: hashedPhone(body.phone),
    fn: hashed(body.firstName),
    ln: hashed(body.lastName),
    ct: hashed(body.city),
    st: hashed(body.state),
    zp: hashed(body.zipCode),
    country: hashed(body.country || "dz"),
    fbc: body.fbc,
    fbp: body.fbp,
    client_ip_address: getClientIp(request),
    client_user_agent: request.headers.get("user-agent") || undefined,
  });

  const event = compact({
    event_name: body.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: body.eventId,
    action_source: body.actionSource || "website",
    event_source_url: body.eventSourceUrl,
    user_data: userData,
    custom_data: Object.keys(customData).length ? customData : undefined,
  });

  const response = await fetch(
    `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${pixelId}/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [event],
        access_token: accessToken,
        test_event_code: process.env.FACEBOOK_TEST_EVENT_CODE || undefined,
      }),
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Facebook CAPI error", result);
    return NextResponse.json(
      { error: "Facebook CAPI request failed", details: result },
      { status: response.status }
    );
  }

  return NextResponse.json({ ok: true, result });
}
