"use client";

import Link from "next/link";
import { Hand } from "lucide-react";
import { SplatViewer } from "@/components/viewer";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "./language-switch";
import { useI18n } from "@/i18n/client";
import type { Space } from "@/lib/spaces";

/** The memorable moment: the homepage opens inside a real suite you can look around. */
export function HomeHero({ space }: { space: Space }) {
  const { locale, t } = useI18n();
  return (
    <section className="relative h-[100svh] min-h-[560px] text-shell">
      <SplatViewer space={space} showMarkers={false} drift className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-casuarina-deep/85 via-casuarina-deep/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-casuarina-deep/60 to-transparent" />

      <header className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href={`/${locale}`} className="font-display text-2xl">
          {locale === "bn" ? "ঝাউবন" : "Jhaubon"}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/book`}>{t.nav.requestStay}</Link>
          </Button>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto max-w-6xl px-5 pb-10 sm:px-8 sm:pb-14">
        <p className="text-sm text-shell/75">{t.place}</p>
        <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.5rem,7vw,5.75rem)] leading-[0.98]">{t.hero.title}</h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-shell/80">{t.hero.body}</p>
        <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href={`/${locale}/spaces/${space.slug}`}>{t.hero.tour(space.name)}</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="#spaces">{t.hero.seeAll}</Link>
          </Button>
          <span className="ml-1 hidden items-center gap-2 text-sm text-shell/65 sm:inline-flex">
            <Hand className="size-4" aria-hidden /> {t.hero.drag}
          </span>
        </div>
      </div>
    </section>
  );
}
