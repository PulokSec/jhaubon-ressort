"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** Swaps /en/… for /bn/… on the current page and remembers the choice. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const other = locale === "en" ? "bn" : "en";
  const href = pathname.replace(/^\/(en|bn)(?=\/|$)/, `/${other}`);
  return (
    <Link
      href={href}
      lang={other}
      hrefLang={other}
      onClick={() => {
        document.cookie = `locale=${other}; path=/; max-age=31536000; samesite=lax`;
      }}
      className={cn("rounded-full px-3 py-1.5 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-wisteria", className)}
    >
      {t.otherLang}
    </Link>
  );
}
