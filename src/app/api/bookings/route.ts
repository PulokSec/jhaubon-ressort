import { NextResponse } from "next/server";
import { z } from "zod";
import { bookingInputSchema } from "@/lib/booking";
import { BookingError, createBooking } from "@/lib/booking-service";
import { notifyNewBooking } from "@/lib/notify";

export async function POST(req: Request) {
  const parsed = bookingInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ errors: z.flattenError(parsed.error).fieldErrors }, { status: 400 });
  }
  try {
    const b = await createBooking(parsed.data);
    await notifyNewBooking(b.reference).catch((e) => console.error("notify failed", e));
    return NextResponse.json(
      {
        reference: b.reference,
        total: b.total,
        advanceDue: b.advanceDue,
        paymentMethod: b.paymentMethod,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.code }, { status: 409 });
    throw e;
  }
}
