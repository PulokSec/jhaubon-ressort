"use client";

import { useI18n } from "@/i18n/client";
import type { Space } from "@/lib/spaces";

/** CC BY 4.0 requires visible attribution for every capture we show. */
export function Credits({ spaces, single = false }: { spaces: Space[]; single?: boolean }) {
  const { t } = useI18n();
  const credited = spaces.filter((s) => s.credit);
  if (!credited.length) return null;
  return (
    <div className="text-sm">
      <p className="opacity-80">{t.footer.captures}</p>
      <ul className="mt-2 space-y-1">
        {credited.map((s) => (
          <li key={s.slug} lang="en">
            <a href={s.credit!.url} target="_blank" rel="noreferrer" className="underline decoration-current/30 underline-offset-4 hover:decoration-current">
              “{s.credit!.title}”
            </a>{" "}
            by {s.credit!.author}, {s.credit!.license}
            {!single && (
              <span className="opacity-70">
                {" "}
                ({t.footer.shownAs} <span lang="">{s.name}</span>)
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
