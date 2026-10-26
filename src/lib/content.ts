import "server-only";
import { cache } from "react";
import { db } from "./db";
import type { Space as SpaceRow } from "@/generated/prisma/client";
import { pick, type Locale } from "@/i18n";
import {
  creditSchema,
  poseSchema,
  storedFactSchema,
  storedViewpointSchema,
  vec3,
  type Space,
} from "./spaces";

export function toPublicSpace(row: SpaceRow, locale: Locale): Space {
  const facts = storedFactSchema.array().catch([]).parse(row.facts);
  const viewpoints = storedViewpointSchema.array().catch([]).parse(row.viewpoints);
  const start = poseSchema.nullable().catch(null).parse(row.startPose);
  const rotation = vec3.catch([180, 0, 0]).parse(row.splatRotation ?? [180, 0, 0]);
  const bn = locale === "bn";
  return {
    slug: row.slug,
    kind: row.kind,
    name: pick(row, "name", locale),
    summary: pick(row, "summary", locale),
    description: pick(row, "description", locale),
    facts: facts.map((f) => ({ label: bn ? f.labelBn : f.labelEn, value: bn ? f.valueBn : f.valueEn })),
    poster: row.posterUrl,
    splat: row.splatUrl && start ? { url: row.splatUrl, rotation, position: [0, 0, 0], scale: 1 } : null,
    start,
    viewpoints: viewpoints.map((v) => ({
      id: v.id,
      title: bn ? v.titleBn : v.titleEn,
      body: bn ? v.bodyBn : v.bodyEn,
      pose: v.pose,
      marker: v.marker,
    })),
    credit: creditSchema.nullable().catch(null).parse(row.credit),
    bookable: row.bookable && row.units > 0,
    nightlyRate: row.nightlyRate,
    maxGuests: row.maxGuests,
  };
}

export const getPublicSpaces = cache(async (locale: Locale) => {
  const rows = await db.space.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } });
  return rows.map((r) => toPublicSpace(r, locale));
});

export const getPublicSpace = cache(async (slug: string, locale: Locale) => {
  const row = await db.space.findFirst({ where: { slug, published: true } });
  return row ? toPublicSpace(row, locale) : null;
});

export const getSettings = cache(async () => {
  return db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
});

/** Settings as plain numbers for the pricing maths. */
export async function getCharges() {
  const s = await getSettings();
  return {
    vatPercent: Number(s.vatPercent),
    serviceChargePercent: Number(s.serviceChargePercent),
    advancePercent: s.advancePercent,
    weekendNights: s.weekendNights,
  };
}
