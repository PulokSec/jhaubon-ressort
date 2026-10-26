import { SignJWT, jwtVerify } from "jose";

/** Edge-safe session helpers (used by proxy.ts and server code). */
export const SESSION_COOKIE = "jhb_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours: one front-desk shift

export type Session = { sub: string; email: string; name: string; role: "OWNER" | "FRONT_DESK" };

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(secret);
}

export async function signSession(s: Session) {
  return new SignJWT({ email: s.email, name: s.name, role: s.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(s.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return {
      sub: payload.sub!,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Session["role"],
    };
  } catch {
    return null;
  }
}

export const sessionCookie = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: MAX_AGE };
