import { NextResponse } from "next/server";
import { jsonError } from "@/core/network/json-error";
import { enquiryRepository } from "@/core/composition/container";
import type { EnquiryBody } from "@/features/enquiries/domain/enquiry-validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: { body?: EnquiryBody; idempotencyKey?: string };
  try {
    payload = (await request.json()) as { body?: EnquiryBody; idempotencyKey?: string };
  } catch {
    return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!payload.body || typeof payload.idempotencyKey !== "string") {
    return NextResponse.json({ message: "Enquiry could not be saved." }, { status: 400 });
  }
  try {
    const result = await enquiryRepository.create(payload.body, payload.idempotencyKey);
    return NextResponse.json(
      { message: result.message, receipt: result.receipt },
      { status: result.statusCode === 200 ? 200 : 201 },
    );
  } catch (error) {
    return jsonError(error);
  }
}
