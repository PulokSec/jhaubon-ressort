import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { SettingsEditor } from "@/components/admin/settings-editor";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin("OWNER");
  const s = await getSettings();
  return (
    <>
      <h1 className="font-display text-4xl">Payments &amp; tax</h1>
      <p className="mt-1 max-w-2xl text-sm text-casuarina/65">
        These apply to new bookings only. Existing bookings keep the amounts they were quoted.
      </p>
      <SettingsEditor
        settings={{
          vatPercent: Number(s.vatPercent),
          serviceChargePercent: Number(s.serviceChargePercent),
          advancePercent: s.advancePercent,
          weekendNights: s.weekendNights,
          bkashNumber: s.bkashNumber ?? "",
          nagadNumber: s.nagadNumber ?? "",
          rocketNumber: s.rocketNumber ?? "",
          bankDetails: s.bankDetails ?? "",
          hotline: s.hotline,
          checkInTime: s.checkInTime,
          checkOutTime: s.checkOutTime,
        }}
      />
    </>
  );
}
