"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { formatDate, formatNumber, formatTaka, type Dictionary } from "@/i18n";
import { useQuote } from "@/lib/queries";
import { addDays } from "@/lib/pricing";
import { paymentMethods, type PaymentMethodKey } from "@/lib/booking";
import { formatBdMobile } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SpaceOption = { slug: string; name: string; maxGuests: number };
type PaymentInfo = { bkash: string | null; nagad: string | null; rocket: string | null; bank: string | null; hotline: string };
type FieldErrors = Partial<Record<string, string[]>>;
type Created = { reference: string; total: number; advanceDue: number; paymentMethod: PaymentMethodKey; phone: string };

type ErrorKey = keyof Dictionary["book"]["errors"];
const errorText = (t: Dictionary, key?: string) =>
  key && key in t.book.errors ? t.book.errors[key as ErrorKey] : key ? t.book.errors.generic : undefined;

/** `today` comes from the server (resort time zone) so the server HTML and the hydrated form agree on the dates. */
export function BookingForm({
  spaces,
  initialSpace,
  payment,
  today,
}: {
  spaces: SpaceOption[];
  initialSpace: string;
  payment: PaymentInfo;
  today: string;
}) {
  const { locale, t } = useI18n();
  const [space, setSpace] = useState(initialSpace);
  const [checkIn, setCheckIn] = useState(() => addDays(today, 7));
  const [checkOut, setCheckOut] = useState(() => addDays(today, 9));
  const [method, setMethod] = useState<PaymentMethodKey>("BKASH");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [created, setCreated] = useState<Created | null>(null);

  const quote = useQuote(space, checkIn, checkOut);
  const selected = spaces.find((s) => s.slug === space);
  const mobileNumber = { BKASH: payment.bkash, NAGAD: payment.nagad, ROCKET: payment.rocket } as Record<string, string | null>;
  const available = paymentMethods.filter((m) => m === "PAY_AT_HOTEL" || (m === "BANK_TRANSFER" ? !!payment.bank : !!mobileNumber[m]));
  const effectiveMethod = available.includes(method) ? method : available[0];

  const submit = useMutation({
    mutationFn: async (form: FormData) => {
      const body = { ...Object.fromEntries(form), space, checkIn, checkOut, paymentMethod: effectiveMethod, locale };
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { form: [data.error ?? "generic"] });
        throw new Error("rejected");
      }
      setErrors({});
      return { ...data, phone: String(form.get("phone")) } as Created;
    },
    onSuccess: (data) => {
      setCreated(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  if (!spaces.length) {
    return <p className="mt-10 text-casuarina/75">{t.book.errors.not_bookable}</p>;
  }
  if (created) return <BookingDone created={created} payment={payment} />;

  const q = quote.data?.quote;
  const charges = quote.data?.charges;
  const soldOut = quote.data && quote.data.freeUnits < 1;
  const quoteError = quote.error instanceof Error ? quote.error.message : undefined;

  return (
    <form
      className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem]"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate(new FormData(e.currentTarget));
      }}
    >
      <div className="grid gap-10">
        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="sr-only">{t.book.summary}</legend>
          <label className="grid gap-1.5 text-sm sm:col-span-2">
            <span className="font-medium">{t.book.suite}</span>
            <select value={space} onChange={(e) => setSpace(e.target.value)} className={inputCls}>
              {spaces.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <Field label={t.book.checkIn} error={errorText(t, errors.checkIn?.[0])}>
            <input type="date" value={checkIn} min={today} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} />
          </Field>
          <Field label={t.book.checkOut} error={errorText(t, errors.checkOut?.[0])}>
            <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} />
          </Field>
          <Field label={t.book.adults} error={errorText(t, errors.adults?.[0] && "too_many_guests")}>
            <input name="adults" type="number" inputMode="numeric" min={1} max={selected?.maxGuests ?? 8} defaultValue={2} className={inputCls} />
          </Field>
          <Field label={t.book.children} hint={selected ? t.book.guestsMax(formatNumber(selected.maxGuests, locale)) : undefined}>
            <input name="children" type="number" inputMode="numeric" min={0} max={6} defaultValue={0} className={inputCls} />
          </Field>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="sr-only">{t.book.name}</legend>
          <Field label={t.book.name} error={errorText(t, errors.guestName?.[0])} className="sm:col-span-2">
            <input name="guestName" autoComplete="name" className={inputCls} />
          </Field>
          <Field label={t.book.phone} hint={t.book.phoneHint} error={errorText(t, errors.phone?.[0])}>
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXX-XXXXXX" className={inputCls} />
          </Field>
          <Field label={t.book.email} error={errorText(t, errors.email?.[0])}>
            <input name="email" type="email" autoComplete="email" className={inputCls} />
          </Field>
          <Field label={t.book.note} className="sm:col-span-2">
            <textarea name="specialNote" rows={3} maxLength={500} className={cn(inputCls, "h-auto py-2")} />
          </Field>
        </fieldset>

        <fieldset>
          <legend className="font-display text-2xl">{t.book.payHow}</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {available.map((m) => (
              <label
                key={m}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-wisteria",
                  effectiveMethod === m ? "border-casuarina bg-white" : "border-casuarina/20 hover:border-casuarina/50",
                )}
              >
                <input type="radio" name="method" value={m} checked={effectiveMethod === m} onChange={() => setMethod(m)} className="mt-1 accent-casuarina" />
                <span>
                  <span className="block font-medium">{t.book.methods[m]}</span>
                  {charges && m !== "PAY_AT_HOTEL" && (
                    <span className="mt-0.5 block text-sm text-casuarina/65">{t.book.advance(formatNumber(charges.advancePercent, locale))}</span>
                  )}
                  {m === "PAY_AT_HOTEL" && <span className="mt-0.5 block text-sm text-casuarina/65">{t.book.payAtHotelNote}</span>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl bg-casuarina p-6 text-shell" aria-live="polite">
          <h2 className="font-display text-2xl">{t.book.summary}</h2>
          {selected && <p className="mt-1 text-shell/75">{selected.name}</p>}
          <p className="mt-1 text-sm text-shell/60">
            {formatDate(checkIn, locale)} → {formatDate(checkOut, locale)}
          </p>

          {quoteError ? (
            <p className="mt-6 text-sm text-shell/85">{errorText(t, quoteError)}</p>
          ) : !q || !charges ? (
            <p className="mt-6 text-sm text-shell/70">{t.book.pickDates}</p>
          ) : (
            <>
              <dl className={cn("mt-6 space-y-2 text-[15px] transition-opacity", quote.isFetching && "opacity-60")}>
                <Row label={t.book.nights(formatNumber(q.nights, locale))} value={formatTaka(q.roomTotal, locale)} />
                {q.weekendNightCount > 0 && <p className="text-[13px] text-shell/60">{t.book.weekendIncl(formatNumber(q.weekendNightCount, locale))}</p>}
                <Row label={t.book.serviceCharge(formatNumber(charges.serviceChargePercent, locale))} value={formatTaka(q.serviceCharge, locale)} />
                <Row label={t.book.vat(formatNumber(charges.vatPercent, locale))} value={formatTaka(q.vat, locale)} />
                <div className="border-t border-shell/20 pt-3">
                  <Row label={t.book.total} value={formatTaka(q.total, locale)} strong />
                </div>
                {effectiveMethod !== "PAY_AT_HOTEL" && (
                  <>
                    <Row label={t.book.advance(formatNumber(charges.advancePercent, locale))} value={formatTaka(q.advanceDue, locale)} />
                    <Row label={t.book.payLater} value={formatTaka(q.total - q.advanceDue, locale)} muted />
                  </>
                )}
              </dl>
              <p className={cn("mt-5 text-sm", soldOut ? "text-[#ffd7c2]" : "text-shell/70")}>
                {soldOut ? t.book.unavailable : t.book.available(formatNumber(quote.data!.freeUnits, locale))}
              </p>
            </>
          )}

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={submit.isPending || !q || !!soldOut}>
            {submit.isPending ? t.book.submitting : t.book.submit}
          </Button>
          {errors.form && (
            <p className="mt-3 text-sm text-[#ffd7c2]" role="alert">
              {errorText(t, errors.form[0])}
            </p>
          )}
          {submit.isError && Object.keys(errors).length === 0 && (
            <p className="mt-3 text-sm text-[#ffd7c2]" role="alert">
              {t.book.errors.generic}
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}

function BookingDone({ created, payment }: { created: Created; payment: PaymentInfo }) {
  const { locale, t } = useI18n();
  const d = t.book.done;
  const number = { BKASH: payment.bkash, NAGAD: payment.nagad, ROCKET: payment.rocket }[created.paymentMethod as "BKASH"];
  const mobile = ["BKASH", "NAGAD", "ROCKET"].includes(created.paymentMethod);
  const [errors, setErrors] = useState<FieldErrors>({});

  const proof = useMutation({
    mutationFn: async (form: FormData) => {
      const res = await fetch(`/api/bookings/${created.reference}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: created.phone, ...Object.fromEntries(form) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? { form: [data.error ?? "generic"] });
        throw new Error("rejected");
      }
      setErrors({});
    },
  });

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div>
        <CheckCircle2 className="size-9 text-wisteria" aria-hidden />
        <h2 className="mt-4 font-display text-4xl">{d.title}</h2>
        <p className="mt-6 text-sm text-casuarina/65">{d.ref}</p>
        <p className="mt-1 font-mono text-3xl tracking-wider" lang="en">
          {created.reference}
        </p>
        <p className="mt-3 max-w-lg text-casuarina/75">{d.sms}</p>

        {created.paymentMethod === "PAY_AT_HOTEL" && <p className="mt-8 max-w-lg text-lg">{d.payAtHotel}</p>}

        {created.paymentMethod === "BANK_TRANSFER" && payment.bank && (
          <div className="mt-8 max-w-lg rounded-xl border border-casuarina/20 p-5">
            <h3 className="font-display text-2xl">{d.bank}</h3>
            <p className="mt-3 whitespace-pre-line text-[15px]">{payment.bank}</p>
            <p className="mt-3 text-sm text-casuarina/70">{d.steps("", created.reference)[1]}</p>
          </div>
        )}

        {mobile && (
          <div className="mt-8 max-w-lg rounded-xl border border-casuarina/20 p-5">
            <h3 className="font-display text-2xl">{d.payTitle(t.book.wallets[created.paymentMethod], formatTaka(created.advanceDue, locale))}</h3>
            {number ? (
              <>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px]">
                  {d.steps(formatBdMobile(number), created.reference).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                {proof.isSuccess ? (
                  <p className="mt-6 flex items-center gap-2 font-medium text-wisteria-deep">
                    <CheckCircle2 className="size-5" aria-hidden /> {d.trxDone}
                  </p>
                ) : (
                  <form
                    className="mt-6 grid gap-4 sm:grid-cols-2"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      proof.mutate(new FormData(e.currentTarget));
                    }}
                  >
                    <Field label={d.trxLabel} error={errorText(t, errors.transactionId?.[0])}>
                      <input name="transactionId" autoCapitalize="characters" autoComplete="off" className={cn(inputCls, "font-mono uppercase")} />
                    </Field>
                    <Field label={d.payerLabel} error={errorText(t, errors.payerNumber?.[0])}>
                      <input name="payerNumber" type="tel" inputMode="tel" defaultValue={created.phone} className={inputCls} />
                    </Field>
                    <Button type="submit" variant="solid" className="sm:col-span-2" disabled={proof.isPending}>
                      {d.trxSubmit}
                    </Button>
                    {errors.form && <p className="text-sm text-red-700 sm:col-span-2">{errorText(t, errors.form[0])}</p>}
                  </form>
                )}
              </>
            ) : (
              <p className="mt-3">{d.noNumber}</p>
            )}
          </div>
        )}
      </div>
      <aside className="h-fit rounded-2xl bg-casuarina p-6 text-shell">
        <dl className="space-y-2 text-[15px]">
          <Row label={t.book.total} value={formatTaka(created.total, locale)} strong />
          {created.advanceDue > 0 && <Row label={t.book.advanceShort} value={formatTaka(created.advanceDue, locale)} />}
        </dl>
        <p className="mt-6 text-sm text-shell/70">{d.hotline}</p>
        <a href={`tel:${payment.hotline}`} className="font-display text-2xl underline decoration-wisteria underline-offset-4" lang="en">
          {formatBdMobile(payment.hotline)}
        </a>
      </aside>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-lg border border-casuarina/20 bg-white px-3 text-[15px] outline-none focus-visible:border-wisteria focus-visible:ring-2 focus-visible:ring-wisteria/30 aria-[invalid=true]:border-red-600";

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactElement<{ "aria-invalid"?: boolean }>;
}) {
  return (
    <label className={cn("grid content-start gap-1.5 text-sm", className)}>
      <span className="font-medium">{label}</span>
      {children}
      {error ? <span className="text-[13px] text-red-700">{error}</span> : hint && <span className="text-[13px] text-casuarina/60">{hint}</span>}
    </label>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", muted && "text-shell/65", strong && "text-lg font-semibold")}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
