import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, localeFromAcceptLanguage } from "@/lib/i18n/config";

const LOCALE_COOKIE = "fawal-locale";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  // An explicit earlier choice beats the browser header.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : localeFromAcceptLanguage(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except API routes, Next internals, and files with an extension.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};

export { LOCALE_COOKIE, DEFAULT_LOCALE };
