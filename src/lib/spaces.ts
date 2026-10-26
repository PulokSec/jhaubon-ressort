import { z } from "zod";

/* Shapes shared by the database JSON columns, the admin forms and the public viewer. */

export const vec3 = z.tuple([z.number(), z.number(), z.number()]);
export const poseSchema = z.object({ position: vec3, target: vec3 });

/** Viewpoint as stored in the DB (bilingual). */
export const storedViewpointSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  titleEn: z.string().min(1),
  titleBn: z.string().min(1),
  bodyEn: z.string().default(""),
  bodyBn: z.string().default(""),
  pose: poseSchema,
  marker: vec3.optional(),
});
export const storedFactSchema = z.object({
  labelEn: z.string().min(1),
  labelBn: z.string().min(1),
  valueEn: z.string().min(1),
  valueBn: z.string().min(1),
});
export const creditSchema = z.object({ title: z.string(), author: z.string(), url: z.string(), license: z.string() });

export type Pose = z.infer<typeof poseSchema>;
export type StoredViewpoint = z.infer<typeof storedViewpointSchema>;
export type StoredFact = z.infer<typeof storedFactSchema>;
export type Credit = z.infer<typeof creditSchema>;
export type SpaceKind = "SUITE" | "LOBBY" | "POOL" | "BATH";

/** Localized, public shape handed to client components. */
export type Viewpoint = { id: string; title: string; body: string; pose: Pose; marker?: [number, number, number] };
export type Space = {
  slug: string;
  kind: SpaceKind;
  name: string;
  summary: string;
  description: string;
  facts: { label: string; value: string }[];
  poster: string | null;
  splat: { url: string; rotation: [number, number, number]; position: [number, number, number]; scale: number } | null;
  start: Pose | null;
  viewpoints: Viewpoint[];
  credit: Credit | null;
  bookable: boolean;
  nightlyRate: number;
  maxGuests: number;
};
