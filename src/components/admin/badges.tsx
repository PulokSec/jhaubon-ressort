import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-emerald-100 text-emerald-900",
  CHECKED_IN: "bg-sky-100 text-sky-900",
  CHECKED_OUT: "bg-stone-200 text-stone-700",
  CANCELLED: "bg-rose-100 text-rose-900",
  UNPAID: "bg-stone-200 text-stone-700",
  AWAITING_VERIFICATION: "bg-violet-100 text-violet-900",
  ADVANCE_PAID: "bg-emerald-100 text-emerald-900",
  PAID: "bg-emerald-200 text-emerald-950",
  REFUNDED: "bg-rose-100 text-rose-900",
};

export const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replaceAll("_", " ");

export function StatusBadge({ value }: { value: string }) {
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap", statusStyle[value])}>{label(value)}</span>;
}

export const methodLabel: Record<string, string> = {
  BKASH: "bKash",
  NAGAD: "Nagad",
  ROCKET: "Rocket",
  BANK_TRANSFER: "Bank transfer",
  PAY_AT_HOTEL: "Pay at hotel",
};
