"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, sessionCookie, signSession } from "@/lib/session";

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = email ? await db.adminUser.findUnique({ where: { email } }) : null;
  // Compare against a dummy hash when the user doesn't exist so timing doesn't reveal valid emails.
  const ok = await bcrypt.compare(password, user?.passwordHash ?? "$2b$12$j7YQOPbAjUN8xBGXkw3kJe2DiMN.H11g6u/sb.OHTa4IDDI7Zckaa");
  if (!user || !ok) return { error: "Wrong email or password.", email };
  const token = await signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookie);
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
