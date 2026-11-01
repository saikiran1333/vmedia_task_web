import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/core/auth/admin-gate";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reason = url.searchParams.get("reason") === "expired" ? "expired" : "signed-out";
  const response = NextResponse.redirect(new URL(`/admin/login?reason=${reason}`, request.url));
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
