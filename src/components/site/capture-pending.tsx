"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Space } from "@/lib/spaces";
import { Button } from "@/components/ui/button";
import { LanguageSwitch } from "./language-switch";
import { useI18n } from "@/i18n/client";

export function CapturePending({ space, others }: { space: Space; others: Space[] }) {
  const { locale, t } = useI18n();
  return (
    <main className="min-h-svh bg-shell">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href={`/${locale}#spaces`} className="inline-flex items-center gap-2 text-sm text-casuarina/75 hover:text-casuarina">
          <ArrowLeft className="size-4" aria-hidden /> {t.nav.allSpaces}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitch className="text-casuarina hover:bg-casuarina/10" />
          <Button asChild variant="solid" size="sm">
            <Link href={`/${locale}/book`}>{t.nav.requestStay}</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-10 sm:px-8 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-sm text-casuarina/60">{t.kinds[space.kind]}</p>
          <h1 className="mt-2 font-display text-5xl leading-[1.02] sm:text-6xl">{space.name}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-casuarina/80">{space.description}</p>
          <dl className="mt-10 grid max-w-xl gap-x-8 gap-y-5 sm:grid-cols-2">
            {space.facts.map((f) => (
              <div key={f.label} className="border-t border-casuarina/15 pt-3">
                <dt className="text-sm text-casuarina/60">{f.label}</dt>
                <dd className="mt-1 font-display text-xl">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {others.length > 0 && (
          <aside className="h-fit rounded-2xl bg-casuarina p-7 text-shell">
            <h2 className="font-display text-2xl">{t.space.pendingTitle}</h2>
            <p className="mt-3 leading-relaxed text-shell/75">{t.space.pendingBody}</p>
            <ul className="mt-5 space-y-2">
              {others.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${locale}/spaces/${s.slug}`}
                    className="font-display text-xl underline decoration-wisteria decoration-2 underline-offset-4 hover:text-white"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </main>
  );
}
