import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../login/actions";
import { AdminNav } from "@/components/admin/nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="min-h-svh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="flex flex-col bg-casuarina-deep px-4 py-5 text-shell md:sticky md:top-0 md:h-svh">
        <Link href="/admin" className="px-2 font-display text-2xl">
          Jhaubon
        </Link>
        <p className="px-2 text-[13px] text-shell/55">Front desk</p>
        <AdminNav isOwner={session.role === "OWNER"} />
        <div className="mt-auto hidden border-t border-shell/15 px-2 pt-4 text-sm md:block">
          <p className="truncate">{session.name}</p>
          <p className="truncate text-[13px] text-shell/55">{session.email}</p>
          <div className="mt-3 flex items-center gap-3">
            <form action={logout}>
              <button className="text-[13px] text-shell/75 underline underline-offset-4 hover:text-shell">Sign out</button>
            </form>
            <Link href="/en" className="text-[13px] text-shell/75 underline underline-offset-4 hover:text-shell" target="_blank">
              View site
            </Link>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12">{children}</main>
    </div>
  );
}
