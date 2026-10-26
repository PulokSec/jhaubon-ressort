"use client";

import { useActionState } from "react";
import { updateBooking, type ActionState } from "@/app/admin/(panel)/actions";
import { Button } from "@/components/ui/button";
import { label } from "./badges";

const STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"];
const PAYMENTS = ["UNPAID", "AWAITING_VERIFICATION", "ADVANCE_PAID", "PAID", "REFUNDED"];

export function BookingEditor(props: { id: string; status: string; paymentStatus: string; adminNote: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateBooking, {});
  return (
    <form action={action} className="h-fit rounded-xl border border-casuarina/12 bg-white p-5">
      <h2 className="font-semibold">Update booking</h2>
      <input type="hidden" name="id" value={props.id} />
      <label className="mt-4 grid gap-1.5 text-sm">
        <span className="font-medium">Booking status</span>
        <select name="status" defaultValue={props.status} className={select}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 grid gap-1.5 text-sm">
        <span className="font-medium">Payment status</span>
        <select name="paymentStatus" defaultValue={props.paymentStatus} className={select}>
          {PAYMENTS.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 grid gap-1.5 text-sm">
        <span className="font-medium">Front-desk note</span>
        <textarea name="adminNote" rows={4} defaultValue={props.adminNote} className={`${select} h-auto py-2`} placeholder="Called guest, confirmed arrival by 3 pm…" />
      </label>
      <p className="mt-3 text-[13px] text-casuarina/60">Cancelled and checked-out bookings free the room for those dates.</p>
      <Button type="submit" variant="solid" className="mt-4 w-full" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
      <p className="mt-2 min-h-5 text-sm" role="status">
        {state.ok && <span className="text-emerald-800">Saved.</span>}
        {state.error && <span className="text-red-700">{state.error}</span>}
      </p>
    </form>
  );
}

const select = "h-10 rounded-lg border border-casuarina/20 bg-white px-3 outline-none focus-visible:border-wisteria focus-visible:ring-2 focus-visible:ring-wisteria/30";
