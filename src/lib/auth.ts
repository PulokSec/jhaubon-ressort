import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "./session";

/** Call at the top of every admin page and server action. The proxy also guards /admin. */
export async function requireAdmin(role?: "OWNER") {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");
  if (role && session.role !== role) redirect("/admin?denied=1");
  return session;
}
