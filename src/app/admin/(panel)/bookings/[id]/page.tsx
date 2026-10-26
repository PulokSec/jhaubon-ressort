import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatTaka } from "@/i18n";
import { formatBdMobile } from "@/lib/phone";
import { StatusBadge, methodLabel } from "@/components/admin/badges";
import { BookingEditor } from "@/components/admin/booking-editor";

export const dynamic = "force-dynamic";

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const b = await db.booking.findUnique({ where: { id }, include: { space: true } });
  if (!b) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Suite", b.space.nameEn],
    ["Check-in", formatDate(b.checkIn, "en")],
    ["Check-out", formatDate(b.checkOut, "en")],
    ["Nights", b.nights],
    ["Guests", `${b.adults} adult${b.adults > 1 ? "s" : ""}${b.children ? `, ${b.children} child${b.children > 1 ? "ren" : ""}` : ""}`],
    ["Phone", <a key="p" href={`tel:${b.phone}`} className="underline underline-offset-4">{formatBdMobile(b.phone)}</a>],
    ["Email", b.email ?? "—"],
    ["Language", b.locale === "bn" ? "Bangla" : "English"],
    ["Guest note", b.specialNote ?? "—"],
    ["Booked", b.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" })],
  ];
  const money: [string, number][] = [
    ["Room", b.roomTotal],
    ["Service charge", b.serviceCharge],
    ["VAT", b.vat],
    ["Total", b.total],
    ["Advance due", b.advanceDue],
    ["Balance at check-in", b.paymentStatus === "PAID" ? 0 : b.total - (["ADVANCE_PAID"].includes(b.paymentStatus) ? b.advanceDue : 0)],
  ];

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-casuarina/70 hover:text-casuarina">
        <ArrowLeft className="size-4" aria-hidden /> Bookings
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-3xl font-semibold">{b.reference}</h1>
        <StatusBadge value={b.status} />
        <StatusBadge value={b.paymentStatus} />
      </div>
      <p className="mt-1 text-lg">{b.guestName}</p>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_24rem]">
        <div className="grid gap-8">
          <section className="rounded-xl border border-casuarina/12 bg-white p-5">
            <h2 className="font-semibold">Stay</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[9rem_1fr]">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-casuarina/60">{k}</dt>
                  <dd className="whitespace-pre-line">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-xl border border-casuarina/12 bg-white p-5">
            <h2 className="font-semibold">Payment</h2>
            <p className="mt-1 text-sm text-casuarina/70">
              {methodLabel[b.paymentMethod]}
              {b.transactionId && (
                <>
                  {" · TrxID "}
                  <span className="font-mono font-medium text-casuarina">{b.transactionId}</span>
                  {b.payerNumber && <> from {formatBdMobile(b.payerNumber)}</>}
                </>
              )}
            </p>
            {b.paymentStatus === "AWAITING_VERIFICATION" && (
              <p className="mt-3 rounded-lg bg-violet-50 p-3 text-sm text-violet-950">
                Check the merchant app for TrxID {b.transactionId} of {formatTaka(b.advanceDue, "en")} before marking the advance as paid.
              </p>
            )}
            <dl className="mt-4 grid max-w-sm gap-y-1.5 text-sm">
              {money.map(([k, v]) => (
                <div key={k} className={`flex justify-between ${k === "Total" ? "border-t border-casuarina/12 pt-1.5 font-semibold" : ""}`}>
                  <dt className="text-casuarina/70">{k}</dt>
                  <dd className="tabular-nums">{formatTaka(v, "en")}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <BookingEditor id={b.id} status={b.status} paymentStatus={b.paymentStatus} adminNote={b.adminNote ?? ""} />
      </div>
    </>
  );
}
