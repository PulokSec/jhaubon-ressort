import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { Providers } from "@/components/providers";
import { LocaleProvider } from "@/i18n/client";
import { isLocale, locales } from "@/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const bn = locale === "bn";
  return {
    title: { default: bn ? "ঝাউবন — গার্ডেন রিসোর্ট, ইনানী" : "Jhaubon — garden resort, Inani", template: bn ? "%s · ঝাউবন" : "%s · Jhaubon" },
    description: bn
      ? "বুকিংয়ের আগে গার্ডেন স্যুটটি থ্রিডিতে ঘুরে দেখুন। কক্সবাজারের ইনানী সৈকতে ছোট্ট একটি গার্ডেন রিসোর্ট।"
      : "Walk through the garden suite in 3D before you book. A small garden resort on Inani beach, Cox's Bazar.",
    alternates: { languages: { en: "/en", bn: "/bn" } },
  };
}

export const viewport: Viewport = { themeColor: "#14231e" };

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    // Extensions (Grammarly, ColorZilla, dark-mode tools) add attributes here before React hydrates.
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LocaleProvider locale={locale}>
          <Providers>{children}</Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
