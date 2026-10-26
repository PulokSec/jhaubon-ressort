import "server-only";

/**
 * Hook for front-desk alerts and guest SMS. Bangladeshi SMS gateways (e.g. SSL Wireless,
 * BulkSMSBD, Alpha SMS) all take an HTTP POST with an API key, sender ID, number and text.
 * Wire one in here; until then new bookings are only logged and shown in /admin.
 */
export async function notifyNewBooking(reference: string) {
  const url = process.env.SMS_API_URL;
  if (!url) {
    console.info(`[booking] ${reference} created (SMS_API_URL not set, no SMS sent)`);
    return;
  }
  // Example shape — adjust field names to your provider's API.
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.SMS_API_KEY ?? ""}` },
    body: JSON.stringify({ to: process.env.FRONT_DESK_PHONE, message: `New booking ${reference}` }),
  });
}
