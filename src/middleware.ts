import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, adminGate } from "@/core/auth/admin-gate";

export function middleware(request: NextRequest) {
  const hasCookie = Boolean(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
  if (adminGate(request.nextUrl.pathname, hasCookie) === "login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
