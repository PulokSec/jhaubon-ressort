/**
 * Bangladeshi mobile numbers: 01[3-9] followed by 8 digits, with or without +88 / 88.
 * Accepts Bengali digits too, since many guests type them on Bangla keyboards.
 */
const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function toAsciiDigits(input: string) {
  return input.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

export function normalizeBdMobile(input: string): string | null {
  const digits = toAsciiDigits(input).replace(/[\s\-()]/g, "");
  const m = digits.match(/^(?:\+?88)?(01[3-9]\d{8})$/);
  return m ? `+88${m[1]}` : null;
}

/** +8801712345678 -> 01712-345678 for display. */
export function formatBdMobile(e164: string) {
  const local = e164.replace(/^\+88/, "");
  return `${local.slice(0, 5)}-${local.slice(5)}`;
}
