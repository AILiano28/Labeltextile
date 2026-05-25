declare global {
  interface Window {
    fbq: any;
  }
}

export const trackFacebookEvent = async ({
  eventName,
  value,
  currency = "USD",
}: {
  eventName: string;
  value?: number;
  currency?: string;
}) => {
  const eventId = crypto.randomUUID();

  // Browser Event
  window.fbq("track", eventName, {
    value,
    currency,
  }, {
    eventID: eventId,
  });

  // Server Event
  await fetch("/api/facebook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_name: eventName,
      event_id: eventId,

      value,
      currency,

      event_source_url: window.location.href,

      fbc: getCookie("_fbc"),
      fbp: getCookie("_fbp"),
    }),
  });
};

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }

  return "";
}