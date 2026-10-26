"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { normalizeBdMobile } from "@/lib/phone";
import { creditSchema, poseSchema, storedFactSchema, storedViewpointSchema, vec3 } from "@/lib/spaces";

export type ActionState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string[] | undefined> };

/** Every public page in both languages (dynamic segments are revalidated by their route pattern). */
function revalidatePublic() {
  revalidatePath("/[locale]", "layout");
}

/* ---------- Bookings ---------- */

const bookingUpdate = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"]),
  paymentStatus: z.enum(["UNPAID", "AWAITING_VERIFICATION", "ADVANCE_PAID", "PAID", "REFUNDED"]),
  adminNote: z.string().max(2000).optional(),
});

export async function updateBooking(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = bookingUpdate.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Check the highlighted fields.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { id, ...data } = parsed.data;
  await db.booking.update({ where: { id }, data: { ...data, adminNote: data.adminNote || null } });
  revalidatePath("/admin");
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: true };
}

/** One-click shortcut from the bookings list. */
export async function verifyAdvance(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  await db.booking.update({ where: { id }, data: { paymentStatus: "ADVANCE_PAID", status: "CONFIRMED" } });
  revalidatePath("/admin");
}

/* ---------- Spaces ---------- */

const json = <T extends z.ZodType>(schema: T) =>
  z.string().transform((raw, ctx) => {
    if (!raw.trim()) return null as z.infer<T> | null;
    try {
      const r = schema.safeParse(JSON.parse(raw));
      if (r.success) return r.data as z.infer<T>;
      ctx.addIssue({ code: "custom", message: r.error.issues.map((i) => `${i.path.join(".") || "value"}: ${i.message}`).join("; ") });
    } catch {
      ctx.addIssue({ code: "custom", message: "Not valid JSON" });
    }
    return z.NEVER;
  });

const optionalInt = z.preprocess((v) => (v === "" || v == null ? null : v), z.coerce.number().int().min(0).nullable());

const spaceUpdate = z.object({
  id: z.string(),
  nameEn: z.string().trim().min(1, "Required"),
  nameBn: z.string().trim().min(1, "Required"),
  summaryEn: z.string().trim().min(1, "Required"),
  summaryBn: z.string().trim().min(1, "Required"),
  descriptionEn: z.string().trim().min(1, "Required"),
  descriptionBn: z.string().trim().min(1, "Required"),
  published: z.literal("on").optional(),
  bookable: z.literal("on").optional(),
  units: z.coerce.number().int().min(0).max(500),
  maxGuests: z.coerce.number().int().min(1).max(20),
  nightlyRate: z.coerce.number().int().min(0),
  weekendRate: optionalInt,
  sortOrder: z.coerce.number().int(),
  splatUrl: z.string().trim(),
  posterUrl: z.string().trim(),
  splatRotation: json(vec3),
  startPose: json(poseSchema),
  facts: json(storedFactSchema.array()),
  viewpoints: json(storedViewpointSchema.array()),
  credit: json(creditSchema),
});

export async function updateSpace(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin("OWNER");
  const parsed = spaceUpdate.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Some fields need fixing.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const d = parsed.data;
  if (d.splatUrl && !d.startPose) return { error: "A 3D capture needs a start pose.", fieldErrors: { startPose: ["Required when a splat URL is set"] } };
  if (d.bookable && (d.units < 1 || d.nightlyRate < 1)) {
    return { error: "A bookable space needs at least 1 unit and a nightly rate.", fieldErrors: { units: ["Min 1 when bookable"] } };
  }
  const { id, ...rest } = d;
  await db.space.update({
    where: { id },
    data: {
      ...rest,
      published: !!d.published,
      bookable: !!d.bookable,
      splatUrl: d.splatUrl || null,
      posterUrl: d.posterUrl || null,
      splatRotation: d.splatRotation ?? undefined,
      startPose: d.startPose ?? undefined,
      facts: d.facts ?? [],
      viewpoints: d.viewpoints ?? [],
      credit: d.credit ?? undefined,
    },
  });
  revalidatePublic();
  revalidatePath("/admin/spaces");
  return { ok: true };
}

/* ---------- Settings ---------- */

const mobile = z.string().transform((v, ctx) => {
  if (!v.trim()) return null;
  const n = normalizeBdMobile(v);
  if (!n) ctx.addIssue({ code: "custom", message: "Not a Bangladeshi mobile number" });
  return n;
});

const settingsUpdate = z.object({
  vatPercent: z.coerce.number().min(0).max(50),
  serviceChargePercent: z.coerce.number().min(0).max(50),
  advancePercent: z.coerce.number().int().min(0).max(100),
  weekendNights: z.array(z.coerce.number().int().min(0).max(6)).default([]),
  bkashNumber: mobile,
  nagadNumber: mobile,
  rocketNumber: mobile,
  bankDetails: z.string().trim().max(1000),
  hotline: z.string().transform((v, ctx) => {
    const n = normalizeBdMobile(v);
    if (!n) ctx.addIssue({ code: "custom", message: "Not a Bangladeshi mobile number" });
    return n ?? "";
  }),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function updateSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin("OWNER");
  const parsed = settingsUpdate.safeParse({ ...Object.fromEntries(form), weekendNights: form.getAll("weekendNights") });
  if (!parsed.success) return { error: "Some fields need fixing.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const data = { ...parsed.data, bankDetails: parsed.data.bankDetails || null };
  await db.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidatePublic();
  revalidatePath("/admin/settings");
  return { ok: true };
}
