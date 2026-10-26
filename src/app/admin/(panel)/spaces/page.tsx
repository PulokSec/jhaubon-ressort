import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { formatTaka } from "@/i18n";
import { label } from "@/components/admin/badges";

export const dynamic = "force-dynamic";

export default async function SpacesPage() {
  await requireAdmin("OWNER");
  const spaces = await db.space.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { bookings: true } } } });
  return (
    <>
      <h1 className="font-display text-4xl">Spaces &amp; rates</h1>
      <p className="mt-1 max-w-2xl text-sm text-casuarina/65">
        Text appears on the site in English and Bangla. Rates are in taka per night, before service charge and VAT.
      </p>
      <div className="mt-8 overflow-x-auto rounded-xl border border-casuarina/12 bg-white">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="border-b border-casuarina/12 text-[13px] text-casuarina/60">
            <tr>
              <th className="px-4 py-3 font-medium">Space</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">On the site</th>
              <th className="px-4 py-3 font-medium">Booking</th>
              <th className="px-4 py-3 text-right font-medium">Weekday / weekend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-casuarina/8">
            {spaces.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/spaces/${s.id}`} className="font-medium underline decoration-casuarina/25 underline-offset-4 hover:decoration-casuarina">
                    {s.nameEn}
                  </Link>
                  <p className="text-casuarina/65" lang="bn">
                    {s.nameBn}
                  </p>
                </td>
                <td className="px-4 py-3">{label(s.kind)}</td>
                <td className="px-4 py-3">
                  {s.published ? "Published" : "Hidden"}
                  <p className="text-[12px] text-casuarina/60">{s.splatUrl ? "3D walkthrough" : "No 3D capture yet"}</p>
                </td>
                <td className="px-4 py-3">
                  {s.bookable ? `${s.units} room${s.units === 1 ? "" : "s"}, up to ${s.maxGuests} guests` : "Not bookable"}
                  <p className="text-[12px] text-casuarina/60">{s._count.bookings} bookings so far</p>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {s.bookable ? `${formatTaka(s.nightlyRate, "en")} / ${formatTaka(s.weekendRate ?? s.nightlyRate, "en")}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
