import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatTaka } from "@/i18n";
import { formatBdMobile, normalizeBdMobile } from "@/lib/phone";
import { StatusBadge, label, methodLabel } from "@/components/admin/badges";
import { verifyAdvance } from "./actions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "", label: "Upcoming" },
  { key: "verify", label: "Payment to verify" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "CHECKED_IN", label: "In house" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "all", label: "All" },
];

function todayUtc() {
  // Front desk days follow Bangladesh time (UTC+6).
  const bd = new Date(Date.now() + 6 * 3600_000);
  return new Date(Date.UTC(bd.getUTCFullYear(), bd.getUTCMonth(), bd.getUTCDate()));
}

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ f?: string; q?: string }> }) {
  await requireAdmin();
  const { f = "", q = "" } = await searchParams;
  const today = todayUtc();

  const where: Prisma.BookingWhereInput = {};
  if (f === "verify") where.paymentStatus = "AWAITING_VERIFICATION";
  else if (f === "") {
    where.checkOut = { gte: today };
    where.status = { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] };
  } else if (f !== "all") where.status = f as Prisma.EnumBookingStatusFilter["equals"];
  if (q.trim()) {
    const phone = normalizeBdMobile(q);
    where.OR = [
      { reference: { contains: q.trim().toUpperCase() } },
      { guestName: { contains: q.trim(), mode: "insensitive" } },
      { transactionId: { contains: q.trim().toUpperCase() } },
      ...(phone ? [{ phone }] : []),
    ];
  }

  const [bookings, arrivals, toVerify, pending, inHouse] = await Promise.all([
    db.booking.findMany({ where, include: { space: true }, orderBy: f === "" ? { checkIn: "asc" } : { createdAt: "desc" }, take: 100 }),
    db.booking.count({ where: { checkIn: today, status: { in: ["PENDING", "CONFIRMED"] } } }),
    db.booking.count({ where: { paymentStatus: "AWAITING_VERIFICATION" } }),
    db.booking.count({ where: { status: "PENDING", checkOut: { gte: today } } }),
    db.booking.count({ where: { status: "CHECKED_IN" } }),
  ]);

  const stats = [
    { label: "Arriving today", value: arrivals, href: "/admin" },
    { label: "Payments to verify", value: toVerify, href: "/admin?f=verify", urgent: toVerify > 0 },
    { label: "Waiting for confirmation", value: pending, href: "/admin?f=PENDING", urgent: pending > 0 },
    { label: "In house", value: inHouse, href: "/admin?f=CHECKED_IN" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Bookings</h1>
          <p className="mt-1 text-sm text-casuarina/65">{formatDate(today, "en")} · Bangladesh time</p>
        </div>
        <form className="flex gap-2" role="search">
          {f && <input type="hidden" name="f" value={f} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Reference, name, phone or TrxID"
            aria-label="Search bookings"
            className="h-10 w-72 max-w-full rounded-lg border border-casuarina/20 bg-white px-3 text-sm outline-none focus-visible:border-wisteria focus-visible:ring-2 focus-visible:ring-wisteria/30"
          />
        </form>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border border-casuarina/12 bg-white p-4 hover:border-casuarina/30">
            <dt className="text-sm text-casuarina/65">{s.label}</dt>
            <dd className={cn("mt-1 text-3xl font-semibold tabular-nums", s.urgent && "text-wisteria-deep")}>{s.value}</dd>
          </Link>
        ))}
      </dl>

      <nav aria-label="Filter bookings" className="mt-8 flex gap-1 overflow-x-auto border-b border-casuarina/12">
        {FILTERS.map((x) => (
          <Link
            key={x.key}
            href={x.key ? `/admin?f=${x.key}` : "/admin"}
            aria-current={f === x.key ? "page" : undefined}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm",
              f === x.key ? "border-casuarina font-medium" : "border-transparent text-casuarina/65 hover:text-casuarina",
            )}
          >
            {x.label}
          </Link>
        ))}
      </nav>

      {bookings.length === 0 ? (
        <p className="mt-10 text-casuarina/70">
          {q ? `No bookings match “${q}”.` : "No bookings here yet. New requests from the website appear in Pending."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-casuarina/12 bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-casuarina/12 text-[13px] text-casuarina/60">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Stay</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-casuarina/8">
              {bookings.map((b) => (
                <tr key={b.id} className="align-top hover:bg-shell/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="font-mono font-medium underline decoration-casuarina/25 underline-offset-4 hover:decoration-casuarina">
                      {b.reference}
                    </Link>
                    <p className="mt-0.5 text-[12px] text-casuarina/55">{b.locale === "bn" ? "Booked in Bangla" : "Booked in English"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.guestName}</p>
                    <a href={`tel:${b.phone}`} className="text-casuarina/70 hover:underline">
                      {formatBdMobile(b.phone)}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <p>{b.space.nameEn}</p>
                    <p className="text-casuarina/70">
                      {formatDate(b.checkIn, "en")} · {b.nights} night{b.nights > 1 ? "s" : ""} · {b.adults + b.children} guest{b.adults + b.children > 1 ? "s" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={b.paymentStatus} />
                    <p className="mt-1 text-[12px] text-casuarina/60">
                      {methodLabel[b.paymentMethod]}
                      {b.transactionId && (
                        <>
                          {" · "}
                          <span className="font-mono">{b.transactionId}</span>
                        </>
                      )}
                    </p>
                    {b.paymentStatus === "AWAITING_VERIFICATION" && (
                      <form action={verifyAdvance} className="mt-2">
                        <input type="hidden" name="id" value={b.id} />
                        <button className="rounded-full bg-casuarina px-3 py-1 text-[12px] font-medium text-shell hover:bg-casuarina-deep">
                          Mark {formatTaka(b.advanceDue, "en")} received &amp; confirm
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <p className="font-medium">{formatTaka(b.total, "en")}</p>
                    {b.advanceDue > 0 && <p className="text-[12px] text-casuarina/60">{label("ADVANCE")} {formatTaka(b.advanceDue, "en")}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
