import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getPublicSpaces, getSettings } from "@/lib/content";
import { getDictionary, isLocale } from "@/i18n";
import { resortToday } from "@/lib/pricing";
import { BookingForm } from "@/components/site/booking-form";
import { LanguageSwitch } from "@/components/site/language-switch";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: isLocale(locale) ? getDictionary(locale).book.title : "Book" };
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ space?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const [spaces, settings, { space }] = await Promise.all([getPublicSpaces(locale), getSettings(), searchParams]);
  const bookable = spaces.filter((s) => s.bookable);

  return (
    <main className="min-h-svh bg-shell">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm text-casuarina/75 hover:text-casuarina">
          <ArrowLeft className="size-4" aria-hidden /> {locale === "bn" ? "ঝাউবন" : "Jhaubon"}
        </Link>
        <LanguageSwitch className="text-casuarina hover:bg-casuarina/10" />
      </header>
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-6 sm:px-8">
        <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl">{t.book.title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-casuarina/75">{t.book.lead}</p>
        <BookingForm
          spaces={bookable.map((s) => ({ slug: s.slug, name: s.name, maxGuests: s.maxGuests }))}
          today={resortToday()}
          initialSpace={bookable.some((s) => s.slug === space) ? space! : bookable[0]?.slug ?? ""}
          payment={{
            bkash: settings.bkashNumber,
            nagad: settings.nagadNumber,
            rocket: settings.rocketNumber,
            bank: settings.bankDetails,
            hotline: settings.hotline,
          }}
        />
      </div>
    </main>
  );
}
