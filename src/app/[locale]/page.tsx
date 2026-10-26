import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicSpaces } from "@/lib/content";
import { getDictionary, isLocale } from "@/i18n";
import { HomeHero } from "@/components/site/home-hero";
import { SpacesIndex } from "@/components/site/spaces-index";
import { Button } from "@/components/ui/button";
import { Credits } from "@/components/site/credits";

export const revalidate = 300; // admin edits also revalidate immediately

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const spaces = await getPublicSpaces(locale);
  const hero = spaces.find((s) => s.splat) ?? spaces[0];

  return (
    <main>
      {hero && <HomeHero space={hero} />}

      <section id="spaces" className="mx-auto max-w-6xl scroll-mt-4 px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-xl">
          <h2 className="font-display text-4xl leading-[1.08] sm:text-5xl">{t.spaces.title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-casuarina/75">{t.spaces.body}</p>
        </div>
        <SpacesIndex spaces={spaces} />
      </section>

      <section className="bg-casuarina text-shell">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <h2 className="font-display text-4xl leading-[1.08] sm:text-5xl">{t.stay.title}</h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-shell/75">{t.stay.body}</p>
            <Button asChild size="lg" className="mt-8">
              <Link href={`/${locale}/book`}>{t.nav.requestStay}</Link>
            </Button>
          </div>
          <dl className="grid content-start gap-x-8 gap-y-6 sm:grid-cols-2">
            {t.stay.facts.map(([k, v]) => (
              <div key={k} className="border-t border-shell/20 pt-3">
                <dt className="text-sm text-shell/60">{k}</dt>
                <dd className="mt-1 font-display text-xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="bg-casuarina-deep text-shell/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 text-sm sm:px-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href={`/${locale}`} className="font-display text-2xl text-shell">
              {locale === "bn" ? "ঝাউবন" : "Jhaubon"}
            </Link>
            <p className="mt-2 max-w-xs">
              {t.place}. {t.footer.demo}
            </p>
          </div>
          <Credits spaces={spaces} />
        </div>
      </footer>
    </main>
  );
}
