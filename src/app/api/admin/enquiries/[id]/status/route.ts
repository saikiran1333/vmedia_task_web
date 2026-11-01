import { NextResponse } from "next/server";
import { jsonError } from "@/core/network/json-error";
import { adminRepository } from "@/core/composition/container";
import { readAdminToken } from "@/features/admin/application/admin-session";
import { isEnquiryStatus } from "@/features/admin/domain/enquiry-query";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = await readAdminToken();
  if (!token) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const { id } = await context.params;
  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!body.status || !isEnquiryStatus(body.status)) {
    return NextResponse.json({ message: "Choose New, Contacted, Converted, or Lost." }, { status: 400 });
  }
  try {
    const enquiry = await adminRepository.updateStatus(token, id, body.status);
    return NextResponse.json({ enquiry });
  } catch (error) {
    return jsonError(error);
  }
}
