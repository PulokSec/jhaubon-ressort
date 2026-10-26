import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicSpace, getPublicSpaces } from "@/lib/content";
import { isLocale } from "@/i18n";
import { SpaceExperience } from "@/components/site/space-experience";
import { CapturePending } from "@/components/site/capture-pending";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const space = await getPublicSpace(slug, locale);
  return space ? { title: space.name, description: space.summary } : {};
}

export default async function SpacePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const space = await getPublicSpace(slug, locale);
  if (!space) notFound();
  if (space.splat) return <SpaceExperience space={space} />;
  const others = (await getPublicSpaces(locale)).filter((s) => s.splat && s.slug !== slug);
  return <CapturePending space={space} others={others} />;
}
