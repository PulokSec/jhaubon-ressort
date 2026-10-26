/** Pure booking maths, shared by the quote API, the booking API and the admin screens. */

export type RateCard = { nightlyRate: number; weekendRate: number | null };
export type Charges = {
  vatPercent: number;
  serviceChargePercent: number;
  advancePercent: number;
  weekendNights: number[];
};

export type Quote = {
  nights: number;
  weekendNightCount: number;
  roomTotal: number;
  serviceCharge: number;
  vat: number;
  total: number;
  advanceDue: number;
};

const DAY = 86_400_000;

/** Parse YYYY-MM-DD as a UTC calendar date so time zones never shift a night. */
export function parseDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Today's date at the resort (Asia/Dhaka) as YYYY-MM-DD, whatever time zone the code runs in. */
export function resortToday(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

/** Shift a YYYY-MM-DD date by whole days. */
export function addDays(iso: string, days: number) {
  return new Date(parseDay(iso).getTime() + days * DAY).toISOString().slice(0, 10);
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / DAY);
}

export function quoteStay(checkIn: Date, checkOut: Date, rates: RateCard, charges: Charges): Quote {
  const nights = nightsBetween(checkIn, checkOut);
  let roomTotal = 0;
  let weekendNightCount = 0;
  for (let i = 0; i < nights; i++) {
    const night = new Date(checkIn.getTime() + i * DAY);
    const weekend = charges.weekendNights.includes(night.getUTCDay()) && rates.weekendRate != null;
    if (weekend) weekendNightCount++;
    roomTotal += weekend ? rates.weekendRate! : rates.nightlyRate;
  }
  // Service charge on the room total, VAT on room + service charge (common BD hotel folio practice;
  // confirm the base with the resort's accountant).
  const serviceCharge = Math.round((roomTotal * charges.serviceChargePercent) / 100);
  const vat = Math.round(((roomTotal + serviceCharge) * charges.vatPercent) / 100);
  const total = roomTotal + serviceCharge + vat;
  const advanceDue = Math.ceil((total * charges.advancePercent) / 100);
  return { nights, weekendNightCount, roomTotal, serviceCharge, vat, total, advanceDue };
}

/** Two stays overlap when each starts before the other ends (check-out day is free). */
export function overlaps(aIn: Date, aOut: Date, bIn: Date, bOut: Date) {
  return aIn < bOut && bIn < aOut;
}
