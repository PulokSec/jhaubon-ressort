import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { paymentProofSchema } from "@/lib/booking";

/** Guest submits their bKash/Nagad/Rocket TrxID. Must quote the phone used to book. */
export async function POST(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const parsed = paymentProofSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ errors: z.flattenError(parsed.error).fieldErrors }, { status: 400 });

  const booking = await db.booking.findUnique({ where: { reference } });
  // Same response for "no such booking" and "wrong phone" so references can't be probed.
  if (!booking || booking.phone !== parsed.data.phone) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (booking.paymentMethod === "PAY_AT_HOTEL" || !["UNPAID", "AWAITING_VERIFICATION"].includes(booking.paymentStatus)) {
    return NextResponse.json({ error: "not_payable" }, { status: 409 });
  }
  await db.booking.update({
    where: { id: booking.id },
    data: {
      transactionId: parsed.data.transactionId,
      payerNumber: parsed.data.payerNumber,
      paymentStatus: "AWAITING_VERIFICATION",
    },
  });
  return NextResponse.json({ ok: true });
}
