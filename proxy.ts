import { NextResponse } from "next/server";
import { auth } from "@/app/utils/auth/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isPublicPage = pathname === "/" || pathname === "/pricing" || pathname === "/about";
  const isInLoginPage = pathname === "/login";

  if (isPublicPage) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isInLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isInLoginPage) {
    return NextResponse.redirect(new URL("/settings", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
