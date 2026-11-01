import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/core/auth/admin-gate";
import { toPublicAdmin } from "@/core/auth/admin-gate";
import { jsonError } from "@/core/network/json-error";
import { adminRepository } from "@/core/composition/container";

export const dynamic = "force-dynamic";

const cookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8,
};

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  try {
    const result = await adminRepository.login(body.email ?? "", body.password ?? "");
    const response = NextResponse.json({ admin: toPublicAdmin(result.admin) });
    response.cookies.set(ADMIN_COOKIE_NAME, result.token, cookie);
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
