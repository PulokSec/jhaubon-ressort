"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BedDouble, CalendarCheck, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const path = usePathname();
  const items = [
    { href: "/admin", label: "Bookings", icon: CalendarCheck, active: path === "/admin" || path.startsWith("/admin/bookings") },
    ...(isOwner
      ? [
          { href: "/admin/spaces", label: "Spaces & rates", icon: BedDouble, active: path.startsWith("/admin/spaces") },
          { href: "/admin/settings", label: "Payments & tax", icon: Settings, active: path.startsWith("/admin/settings") },
        ]
      : []),
  ];
  return (
    <nav className="mt-6 flex gap-1 overflow-x-auto md:flex-col">
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={href}
          href={href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-wisteria",
            active ? "bg-shell/12 text-shell" : "text-shell/70 hover:bg-shell/8 hover:text-shell",
          )}
        >
          <Icon className="size-4" aria-hidden /> {label}
        </Link>
      ))}
    </nav>
  );
}
