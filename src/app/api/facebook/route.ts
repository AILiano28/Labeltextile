import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "";

    const userAgent = req.headers.get("user-agent") || "";

    const payload = {
      data: [
        {
          event_name: body.event_name,
          event_time: Math.floor(Date.now() / 1000),

          event_id: body.event_id,

          action_source: "website",

          event_source_url: body.event_source_url,

          user_data: {
            client_ip_address: ip,
            client_user_agent: userAgent,

            fbc: body.fbc,
            fbp: body.fbp,
          },

          custom_data: {
            value: body.value,
            currency: body.currency,
          },
        },
      ],
    };

    const response = await fetch(
      `https://graph.facebook.com/v22.0/${process.env.FACEBOOK_PIXEL_ID}/events?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Facebook CAPI Error" },
      { status: 500 }
    );
  }
}