import { NextResponse } from "next/server";
import { z } from "zod";
import { BookingError, getQuote } from "@/lib/booking-service";

const query = z.object({ space: z.string().min(1), checkIn: z.iso.date(), checkOut: z.iso.date() });

export async function GET(req: Request) {
  const parsed = query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "dates" }, { status: 400 });
  try {
    const { quote, freeUnits, charges } = await getQuote(parsed.data.space, parsed.data.checkIn, parsed.data.checkOut);
    return NextResponse.json({ quote, freeUnits, charges });
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.code }, { status: e.code === "not_found" ? 404 : 400 });
    throw e;
  }
}
