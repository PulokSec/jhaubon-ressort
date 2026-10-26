import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { defaultLocale, isLocale } from "@/i18n";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) return NextResponse.redirect(new URL("/admin/login", req.url));
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  // No locale in the URL: use the saved choice, else the browser language, else English.
  const saved = req.cookies.get("locale")?.value;
  const accept = req.headers.get("accept-language") ?? "";
  const locale = saved && isLocale(saved) ? saved : /\bbn\b/i.test(accept) ? "bn" : defaultLocale;
  return NextResponse.redirect(new URL(`/${locale}${pathname === "/" ? "" : pathname}${search}`, req.url));
}

export const config = {
  // Skip API routes, Next internals and static files (splats, posters, fonts, favicon).
  matcher: ["/((?!api|_next|.*\\.[\\w]+$).*)"],
};
