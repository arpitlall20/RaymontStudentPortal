import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isStudentArea = pathname.startsWith("/portal");
  const isAdminArea = pathname.startsWith("/admin");

  if (!token && (isStudentArea || isAdminArea)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (token && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = token.role === "ADMIN" ? "/admin" : "/portal";
    return NextResponse.redirect(url);
  }

  if (token && isAdminArea && token.role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/portal";
    return NextResponse.redirect(url);
  }

  if (token && isStudentArea && token.role !== "STUDENT") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*", "/login", "/register"],
};
