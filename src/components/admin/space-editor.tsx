"use client";

import { useActionState } from "react";
import { updateSpace, type ActionState } from "@/app/admin/(panel)/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SpaceForm = {
  id: string;
  nameEn: string;
  nameBn: string;
  summaryEn: string;
  summaryBn: string;
  descriptionEn: string;
  descriptionBn: string;
  published: boolean;
  bookable: boolean;
  units: number;
  maxGuests: number;
  nightlyRate: number;
  weekendRate: number | null;
  sortOrder: number;
  splatUrl: string;
  posterUrl: string;
  splatRotation: string;
  startPose: string;
  facts: string;
  viewpoints: string;
  credit: string;
};

export function SpaceEditor({ space }: { space: SpaceForm }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSpace, {});
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={action} className="mt-8 grid max-w-5xl gap-8">
      <input type="hidden" name="id" value={space.id} />

      <Section title="Text" note="English on the left, Bangla on the right. Both are required.">
        <div className="grid gap-5 md:grid-cols-2">
          <Text name="nameEn" label="Name" defaultValue={space.nameEn} error={err("nameEn")} />
          <Text name="nameBn" label="নাম" defaultValue={space.nameBn} error={err("nameBn")} lang="bn" />
          <Text name="summaryEn" label="One-line summary" defaultValue={space.summaryEn} error={err("summaryEn")} />
          <Text name="summaryBn" label="এক লাইনের সারাংশ" defaultValue={space.summaryBn} error={err("summaryBn")} lang="bn" />
          <Text name="descriptionEn" label="Description" defaultValue={space.descriptionEn} error={err("descriptionEn")} rows={4} />
          <Text name="descriptionBn" label="বিবরণ" defaultValue={space.descriptionBn} error={err("descriptionBn")} rows={4} lang="bn" />
        </div>
      </Section>

      <Section title="Booking & rates" note="Weekend rate applies to the nights set under Payments & tax. Leave it empty to charge the weekday rate every night.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Text name="nightlyRate" label="Weekday rate (৳/night)" type="number" defaultValue={String(space.nightlyRate)} error={err("nightlyRate")} />
          <Text name="weekendRate" label="Weekend rate (৳/night)" type="number" defaultValue={space.weekendRate?.toString() ?? ""} error={err("weekendRate")} />
          <Text name="units" label="Rooms of this type" type="number" defaultValue={String(space.units)} error={err("units")} />
          <Text name="maxGuests" label="Max guests per room" type="number" defaultValue={String(space.maxGuests)} error={err("maxGuests")} />
        </div>
        <div className="mt-5 flex flex-wrap gap-6">
          <Check name="bookable" label="Guests can book this online" defaultChecked={space.bookable} />
          <Check name="published" label="Show on the website" defaultChecked={space.published} />
          <Text name="sortOrder" label="Order on the site" type="number" defaultValue={String(space.sortOrder)} className="w-36" />
        </div>
      </Section>

      <Section
        title="3D walkthrough"
        note="Leave the splat URL empty until the space is captured; the site then shows a ‘coming soon’ page. Camera poses are [x, y, z] in the splat’s coordinates."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Text name="splatUrl" label="Splat file URL (.sog)" defaultValue={space.splatUrl} placeholder="https://cdn.example.com/splats/pool.sog" />
          <Text name="posterUrl" label="Poster image URL" defaultValue={space.posterUrl} placeholder="/posters/pool.webp" />
          <Code name="splatRotation" label="Splat rotation (Euler degrees)" defaultValue={space.splatRotation} error={err("splatRotation")} rows={2} placeholder="[180, 0, 0]" />
          <Code name="startPose" label="Start pose" defaultValue={space.startPose} error={err("startPose")} rows={4} placeholder='{ "position": [0, 1.5, 3], "target": [0, 1, 0] }' />
        </div>
        <Code
          name="viewpoints"
          label="Viewpoints (tour stops)"
          note="Each: id, titleEn, titleBn, bodyEn, bodyBn, pose { position, target }, optional marker [x, y, z]."
          defaultValue={space.viewpoints}
          error={err("viewpoints")}
          rows={14}
          className="mt-5"
        />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Code name="facts" label="Facts" note="Each: labelEn, labelBn, valueEn, valueBn." defaultValue={space.facts} error={err("facts")} rows={10} />
          <Code name="credit" label="Capture credit (required for CC BY)" note="title, author, url, license" defaultValue={space.credit} error={err("credit")} rows={10} />
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-5 flex items-center gap-4 border-t border-casuarina/12 bg-[#f6f7f4]/95 px-5 py-4 backdrop-blur">
        <Button type="submit" variant="solid" disabled={pending}>
          {pending ? "Saving…" : "Save space"}
        </Button>
        <p className="text-sm" role="status">
          {state.ok && <span className="text-emerald-800">Saved. The website updates within a few seconds.</span>}
          {state.error && <span className="text-red-700">{state.error}</span>}
        </p>
      </div>
    </form>
  );
}

const field =
  "w-full rounded-lg border border-casuarina/20 bg-white px-3 text-[15px] outline-none focus-visible:border-wisteria focus-visible:ring-2 focus-visible:ring-wisteria/30 aria-[invalid=true]:border-red-600";

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-casuarina/12 bg-white p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {note && <p className="mt-1 max-w-2xl text-sm text-casuarina/65">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Text({
  label,
  error,
  rows,
  className,
  ...input
}: { label: string; error?: string; rows?: number; className?: string } & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cn("grid content-start gap-1.5 text-sm", className)} lang={input.lang}>
      <span className="font-medium">{label}</span>
      {rows ? (
        <textarea rows={rows} aria-invalid={!!error} className={cn(field, "py-2 leading-relaxed")} {...input} />
      ) : (
        <input aria-invalid={!!error} className={cn(field, "h-10")} {...input} />
      )}
      {error && <span className="text-[13px] text-red-700">{error}</span>}
    </label>
  );
}

function Code({
  label,
  note,
  error,
  className,
  ...ta
}: { label: string; note?: string; error?: string; className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cn("grid content-start gap-1.5 text-sm", className)}>
      <span className="font-medium">{label}</span>
      {note && <span className="text-[13px] text-casuarina/60">{note}</span>}
      <textarea spellCheck={false} aria-invalid={!!error} className={cn(field, "py-2 font-mono text-[13px] leading-relaxed")} {...ta} />
      {error && <span className="text-[13px] text-red-700">{error}</span>}
    </label>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2.5 self-end pb-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-casuarina" />
      {label}
    </label>
  );
}
