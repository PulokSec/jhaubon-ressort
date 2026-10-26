import { z } from "zod";
import { normalizeBdMobile } from "./phone";

export const paymentMethods = ["BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "PAY_AT_HOTEL"] as const;
export type PaymentMethodKey = (typeof paymentMethods)[number];

const isoDate = z.iso.date();

/** Error messages are keys into the dictionary so they can be shown in English or Bengali. */
export const bookingInputSchema = z
  .object({
    space: z.string().min(1),
    checkIn: isoDate,
    checkOut: isoDate,
    adults: z.coerce.number().int().min(1).max(8),
    children: z.coerce.number().int().min(0).max(6).default(0),
    guestName: z.string().trim().min(2, "name"),
    phone: z.string().transform((v, ctx) => {
      const n = normalizeBdMobile(v);
      if (!n) ctx.addIssue({ code: "custom", message: "phone" });
      return n ?? "";
    }),
    email: z.union([z.literal(""), z.email("email")]).optional(),
    specialNote: z.string().trim().max(500).optional(),
    paymentMethod: z.enum(paymentMethods),
    locale: z.enum(["en", "bn"]).default("en"),
  })
  .refine((d) => d.checkOut > d.checkIn, { message: "dates", path: ["checkOut"] });

export type BookingInput = z.infer<typeof bookingInputSchema>;

export const paymentProofSchema = z.object({
  phone: z.string().transform((v, ctx) => {
    const n = normalizeBdMobile(v);
    if (!n) ctx.addIssue({ code: "custom", message: "phone" });
    return n ?? "";
  }),
  // bKash/Nagad/Rocket TrxIDs are 8–12 uppercase letters and digits.
  transactionId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{8,12}$/, "trx"),
  payerNumber: z.string().transform((v, ctx) => {
    const n = normalizeBdMobile(v);
    if (!n) ctx.addIssue({ code: "custom", message: "phone" });
    return n ?? "";
  }),
});
