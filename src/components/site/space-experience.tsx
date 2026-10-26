"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Info, Pause, Play } from "lucide-react";
import { SplatViewer } from "@/components/viewer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LanguageSwitch } from "./language-switch";
import { useI18n } from "@/i18n/client";
import { formatNumber } from "@/i18n";
import { Credits } from "./credits";
import type { Space } from "@/lib/spaces";
import { cn } from "@/lib/utils";

const STOP_SECONDS = 7;

export function SpaceExperience({ space }: { space: Space }) {
  const { locale, t } = useI18n();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [touring, setTouring] = useState(false);
  const stops = space.viewpoints;
  const active = stops.find((v) => v.id === activeId) ?? null;

  // Guided tour: advance one stop every few seconds, stop after the last one.
  useEffect(() => {
    if (!touring) return;
    const i = stops.findIndex((v) => v.id === activeId);
    const t = setTimeout(() => {
      if (i + 1 < stops.length) setActiveId(stops[i + 1].id);
      else setTouring(false);
    }, STOP_SECONDS * 1000);
    return () => clearTimeout(t);
  }, [touring, activeId, stops]);



  return (
    <main className="fixed inset-0 overflow-hidden bg-casuarina-deep text-shell">
      <SplatViewer
        space={space}
        activeId={activeId}
        onSelect={(v) => {
          setTouring(false);
          setActiveId(v.id);
        }}
        className="absolute inset-0"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-casuarina-deep/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-casuarina-deep/90 via-casuarina-deep/45 to-transparent" />

      <header className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}#spaces`}>
            <ArrowLeft aria-hidden /> {t.nav.allSpaces}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <Button asChild size="sm" variant={space.bookable ? "accent" : "outline"}>
            <Link href={`/${locale}/book${space.bookable ? `?space=${space.slug}` : ""}`}>
              {space.bookable ? t.space.bookThis : t.nav.requestStay}
            </Link>
          </Button>
        </div>
      </header>

      <section className="absolute inset-x-0 bottom-0 px-4 pb-5 sm:px-6 sm:pb-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl" aria-live="polite">
            <p className="text-sm text-shell/65">
              {t.kinds[space.kind]}
              {active ? ` · ${space.name}` : ""}
            </p>
            <h1 className="mt-1 font-display text-4xl leading-[1.02] sm:text-5xl">{active ? active.title : space.name}</h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-shell/80">{active ? active.body : space.summary}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:max-w-[46rem] lg:justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t.space.about(space.name)}>
                  <Info aria-hidden />
                </Button>
              </DialogTrigger>
              <DialogContent side="right">
                <p className="text-sm text-casuarina/60">{t.kinds[space.kind]}</p>
                <DialogTitle className="mt-1 text-4xl">{space.name}</DialogTitle>
                <DialogDescription className="text-base">{space.description}</DialogDescription>
                <dl className="mt-8 space-y-4">
                  {space.facts.map((f) => (
                    <div key={f.label} className="flex items-baseline justify-between gap-4 border-t border-casuarina/15 pt-3">
                      <dt className="text-sm text-casuarina/60">{f.label}</dt>
                      <dd className="text-right font-display text-lg">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-10 text-casuarina/75">
                  <Credits spaces={[space]} single />
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (touring) return setTouring(false);
                // Start from the first stop unless the visitor is mid-way through.
                const i = stops.findIndex((v) => v.id === activeId);
                setActiveId(stops[i === -1 || i === stops.length - 1 ? 0 : i]?.id ?? null);
                setTouring(true);
              }}
              aria-pressed={touring}
            >
              {touring ? <Pause aria-hidden /> : <Play aria-hidden />}
              {touring ? t.space.pause : t.space.play}
            </Button>
            <nav aria-label={t.space.viewpoints} className="flex flex-wrap gap-2">
              {stops.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setTouring(false);
                    setActiveId(v.id);
                  }}
                  aria-current={v.id === activeId ? "step" : undefined}
                  className={cn(
                    "relative h-8 overflow-hidden rounded-full px-3.5 text-[13px] outline-none backdrop-blur-md transition-colors focus-visible:ring-2 focus-visible:ring-shell",
                    v.id === activeId ? "bg-shell text-casuarina" : "bg-casuarina/60 text-shell hover:bg-casuarina/85",
                  )}
                >
                  <span className="relative">
                    {formatNumber(i + 1, locale)}. {v.title}
                  </span>
                  {touring && v.id === activeId && (
                    <span
                      key={activeId}
                      className="tour-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-wisteria"
                      style={{ animationDuration: `${STOP_SECONDS}s` }}
                      aria-hidden
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <p className="mt-4 hidden text-[13px] text-shell/55 sm:block">
          {t.space.hint}
        </p>
      </section>
    </main>
  );
}
