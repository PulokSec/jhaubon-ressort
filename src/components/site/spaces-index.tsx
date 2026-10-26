"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { formatNumber, formatTaka } from "@/i18n";
import type { Space } from "@/lib/spaces";
import { cn } from "@/lib/utils";

export function SpacesIndex({ spaces }: { spaces: Space[] }) {
  const { locale, t } = useI18n();
  return (
    <ul className="mt-14 border-t border-casuarina/15">
      {spaces.map((s) => {
        const ready = !!s.splat;
        return (
          <li key={s.slug} className="border-b border-casuarina/15">
            <Link
              href={`/${locale}/spaces/${s.slug}`}
              className="group grid gap-x-8 gap-y-2 py-7 outline-none focus-visible:bg-mist sm:grid-cols-[8rem_1fr_auto] sm:items-baseline"
            >
              <span className="text-sm text-casuarina/60">{t.kinds[s.kind]}</span>
              <span>
                <span className="font-display text-3xl leading-tight decoration-wisteria decoration-2 underline-offset-[6px] group-hover:underline sm:text-4xl">
                  {s.name}
                </span>
                <span className="mt-2 block max-w-xl text-[15px] leading-relaxed text-casuarina/70">{s.summary}</span>
              </span>
              <span className="flex flex-col gap-1 text-sm sm:items-end">
                <span className={cn("inline-flex w-fit items-center gap-2", ready ? "text-wisteria-deep" : "text-casuarina/50")}>
                  <span className={cn("size-2 rounded-full", ready ? "bg-wisteria" : "border border-casuarina/40")} aria-hidden />
                  {ready ? t.spaces.ready(formatNumber(s.viewpoints.length, locale)) : t.spaces.pending}
                </span>
                {s.bookable && s.nightlyRate > 0 && <span className="text-casuarina/70">{t.spaces.from(formatTaka(s.nightlyRate, locale))}</span>}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
