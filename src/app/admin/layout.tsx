import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = { title: { default: "Admin · Jhaubon", template: "%s · Jhaubon admin" }, robots: { index: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Extensions (Grammarly, ColorZilla, dark-mode tools) add attributes here before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#f6f7f4]" suppressHydrationWarning>{children}</body>
    </html>
  );
}
