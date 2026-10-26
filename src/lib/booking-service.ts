import "server-only";
import { db } from "./db";
import { getCharges } from "./content";
import { parseDay, quoteStay, nightsBetween } from "./pricing";
import type { BookingInput } from "./booking";

const BLOCKING = ["PENDING", "CONFIRMED", "CHECKED_IN"] as const;
const MAX_NIGHTS = 30;
const MAX_DAYS_AHEAD = 365;

export class BookingError extends Error {
  constructor(public code: "not_found" | "not_bookable" | "too_many_guests" | "dates" | "unavailable") {
    super(code);
  }
}

/** Booked rooms of a space overlapping the stay. Pass a transaction client to count inside a lock. */
async function bookedUnits(client: Pick<typeof db, "booking">, spaceId: string, checkIn: Date, checkOut: Date) {
  return client.booking.count({
    where: { spaceId, status: { in: [...BLOCKING] }, checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
  });
}

function validateDates(checkIn: Date, checkOut: Date) {
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const nights = nightsBetween(checkIn, checkOut);
  if (checkIn.getTime() < todayUtc || nights < 1 || nights > MAX_NIGHTS) throw new BookingError("dates");
  if (checkIn.getTime() > todayUtc + MAX_DAYS_AHEAD * 86_400_000) throw new BookingError("dates");
}

export async function getQuote(slug: string, checkInIso: string, checkOutIso: string) {
  const space = await db.space.findUnique({ where: { slug } });
  if (!space || !space.published) throw new BookingError("not_found");
  if (!space.bookable || space.units < 1) throw new BookingError("not_bookable");
  const checkIn = parseDay(checkInIso);
  const checkOut = parseDay(checkOutIso);
  validateDates(checkIn, checkOut);
  const charges = await getCharges();
  const quote = quoteStay(checkIn, checkOut, space, charges);
  const free = space.units - (await bookedUnits(db, space.id, checkIn, checkOut));
  return { quote, freeUnits: Math.max(0, free), charges };
}

/** Short, unambiguous reference: no 0/O/1/I. */
function newReference() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return "JHB-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function createBooking(input: BookingInput) {
  const space = await db.space.findUnique({ where: { slug: input.space } });
  if (!space || !space.published) throw new BookingError("not_found");
  if (!space.bookable || space.units < 1) throw new BookingError("not_bookable");
  if (input.adults + input.children > space.maxGuests) throw new BookingError("too_many_guests");

  const checkIn = parseDay(input.checkIn);
  const checkOut = parseDay(input.checkOut);
  validateDates(checkIn, checkOut);
  const charges = await getCharges();
  const q = quoteStay(checkIn, checkOut, space, charges);
  const payAtHotel = input.paymentMethod === "PAY_AT_HOTEL";

  return db.$transaction(async (tx) => {
    // Serialise bookings per space so two guests can't both take the last room.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${space.id}))`;
    const taken = await bookedUnits(tx, space.id, checkIn, checkOut);
    if (taken >= space.units) throw new BookingError("unavailable");

    return tx.booking.create({
      data: {
        reference: newReference(),
        spaceId: space.id,
        checkIn,
        checkOut,
        nights: q.nights,
        adults: input.adults,
        children: input.children,
        guestName: input.guestName,
        phone: input.phone,
        email: input.email || null,
        specialNote: input.specialNote || null,
        locale: input.locale,
        roomTotal: q.roomTotal,
        serviceCharge: q.serviceCharge,
        vat: q.vat,
        total: q.total,
        advanceDue: payAtHotel ? 0 : q.advanceDue,
        paymentMethod: input.paymentMethod,
      },
    });
  });
}
