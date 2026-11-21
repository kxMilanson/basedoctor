import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "basedoctor_jwt_super_secret_key_prod_28ac3b7636f420bdbb76bf75be5432fa!"
);

const PROTECTED_PREFIXES = ["/dashboard", "/connections", "/scans", "/admin"];
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("basedoctor_session")?.value;

  let sessionUser: { id: string; email: string; role: string } | null = null;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      if (payload.id && payload.email) {
        sessionUser = {
          id: payload.id as string,
          email: payload.email as string,
          role: (payload.role as string) || "USER",
        };
      }
    } catch {
      // Invalid or expired token
      sessionUser = null;
    }
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // If attempting to access protected route without valid session
  if (isProtected && !sessionUser) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing /admin and not an ADMIN
  if (pathname.startsWith("/admin") && sessionUser?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If already logged in and visiting login/register, redirect to dashboard
  if (sessionUser && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/connections/:path*",
    "/scans/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
