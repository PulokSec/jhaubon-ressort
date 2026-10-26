import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SpaceEditor } from "@/components/admin/space-editor";

export const dynamic = "force-dynamic";

const pretty = (v: unknown) => (v == null ? "" : JSON.stringify(v, null, 2));

export default async function EditSpacePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("OWNER");
  const { id } = await params;
  const s = await db.space.findUnique({ where: { id } });
  if (!s) notFound();
  return (
    <>
      <Link href="/admin/spaces" className="inline-flex items-center gap-1.5 text-sm text-casuarina/70 hover:text-casuarina">
        <ArrowLeft className="size-4" aria-hidden /> Spaces &amp; rates
      </Link>
      <h1 className="mt-4 font-display text-4xl">{s.nameEn}</h1>
      <p className="mt-1 text-sm text-casuarina/65">
        <Link href={`/en/spaces/${s.slug}`} target="_blank" className="underline underline-offset-4">
          /en/spaces/{s.slug}
        </Link>{" "}
        ·{" "}
        <Link href={`/bn/spaces/${s.slug}`} target="_blank" className="underline underline-offset-4">
          /bn/spaces/{s.slug}
        </Link>
      </p>
      <SpaceEditor
        space={{
          id: s.id,
          nameEn: s.nameEn,
          nameBn: s.nameBn,
          summaryEn: s.summaryEn,
          summaryBn: s.summaryBn,
          descriptionEn: s.descriptionEn,
          descriptionBn: s.descriptionBn,
          published: s.published,
          bookable: s.bookable,
          units: s.units,
          maxGuests: s.maxGuests,
          nightlyRate: s.nightlyRate,
          weekendRate: s.weekendRate,
          sortOrder: s.sortOrder,
          splatUrl: s.splatUrl ?? "",
          posterUrl: s.posterUrl ?? "",
          splatRotation: pretty(s.splatRotation),
          startPose: pretty(s.startPose),
          facts: pretty(s.facts),
          viewpoints: pretty(s.viewpoints),
          credit: pretty(s.credit),
        }}
      />
    </>
  );
}
