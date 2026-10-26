"use client";

import { useActionState } from "react";
import { updateSettings, type ActionState } from "@/app/admin/(panel)/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Settings = {
  vatPercent: number;
  serviceChargePercent: number;
  advancePercent: number;
  weekendNights: number[];
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  bankDetails: string;
  hotline: string;
  checkInTime: string;
  checkOutTime: string;
};

const NIGHTS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function SettingsEditor({ settings: s }: { settings: Settings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSettings, {});
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={action} className="mt-8 grid max-w-3xl gap-8">
      <Section title="Mobile banking" note="Guests send the advance to these numbers and enter the TrxID. Leave a number empty to hide that option.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field name="bkashNumber" label="bKash merchant / personal" defaultValue={s.bkashNumber} error={err("bkashNumber")} placeholder="01XXX-XXXXXX" />
          <Field name="nagadNumber" label="Nagad" defaultValue={s.nagadNumber} error={err("nagadNumber")} placeholder="01XXX-XXXXXX" />
          <Field name="rocketNumber" label="Rocket" defaultValue={s.rocketNumber} error={err("rocketNumber")} placeholder="01XXX-XXXXXX" />
        </div>
        <label className="mt-5 grid gap-1.5 text-sm">
          <span className="font-medium">Bank transfer details</span>
          <span className="text-[13px] text-casuarina/60">Shown to guests who pick bank transfer. Leave empty to hide that option.</span>
          <textarea
            name="bankDetails"
            rows={4}
            defaultValue={s.bankDetails}
            placeholder={"Account name: …\nAccount no.: …\nBank & branch: …\nRouting no.: …"}
            className={cn(input, "py-2")}
          />
        </label>
      </Section>

      <Section title="Charges" note="Hotel VAT in Bangladesh depends on the property’s category and changes with the budget. Confirm these with your accountant.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field name="vatPercent" label="VAT %" type="number" step="0.01" defaultValue={String(s.vatPercent)} error={err("vatPercent")} />
          <Field name="serviceChargePercent" label="Service charge %" type="number" step="0.01" defaultValue={String(s.serviceChargePercent)} error={err("serviceChargePercent")} />
          <Field name="advancePercent" label="Advance to confirm %" type="number" defaultValue={String(s.advancePercent)} error={err("advancePercent")} />
        </div>
        <fieldset className="mt-6">
          <legend className="text-sm font-medium">Nights charged at the weekend rate</legend>
          <p className="text-[13px] text-casuarina/60">A night is named by the day it starts. Bangladesh’s weekend is Friday–Saturday, so Thursday and Friday nights are usually the busiest.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {NIGHTS.map((n, i) => (
              <label key={n} className="flex items-center gap-2 rounded-full border border-casuarina/20 px-3 py-1.5 text-sm has-[:checked]:border-casuarina has-[:checked]:bg-casuarina has-[:checked]:text-shell">
                <input type="checkbox" name="weekendNights" value={i} defaultChecked={s.weekendNights.includes(i)} className="sr-only" />
                {n}
              </label>
            ))}
          </div>
        </fieldset>
      </Section>

      <Section title="Front desk">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field name="hotline" label="Hotline" defaultValue={s.hotline} error={err("hotline")} />
          <Field name="checkInTime" label="Check-in from" type="time" defaultValue={s.checkInTime} error={err("checkInTime")} />
          <Field name="checkOutTime" label="Check-out by" type="time" defaultValue={s.checkOutTime} error={err("checkOutTime")} />
        </div>
      </Section>

      <div className="flex items-center gap-4">
        <Button type="submit" variant="solid" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        <p className="text-sm" role="status">
          {state.ok && <span className="text-emerald-800">Saved.</span>}
          {state.error && <span className="text-red-700">{state.error}</span>}
        </p>
      </div>
    </form>
  );
}

const input =
  "w-full rounded-lg border border-casuarina/20 bg-white px-3 text-[15px] outline-none focus-visible:border-wisteria focus-visible:ring-2 focus-visible:ring-wisteria/30 aria-[invalid=true]:border-red-600";

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-casuarina/12 bg-white p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {note && <p className="mt-1 text-sm text-casuarina/65">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, error, ...p }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid content-start gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input aria-invalid={!!error} className={cn(input, "h-10")} {...p} />
      {error && <span className="text-[13px] text-red-700">{error}</span>}
    </label>
  );
}
