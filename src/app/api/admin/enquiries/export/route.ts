import { NextResponse } from "next/server";
import { env } from "@/core/config/env";
import { jsonError } from "@/core/network/json-error";
import { apiGetRaw } from "@/core/network/api-client";
import { readAdminToken } from "@/features/admin/application/admin-session";
import { enquirySearchParams, parseEnquirySearchParams } from "@/features/admin/domain/enquiry-query";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = await readAdminToken();
  if (!token) return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  const filters = parseEnquirySearchParams(new URL(request.url).searchParams);
  const params = enquirySearchParams(filters, { paginate: false });
  try {
    const file = await apiGetRaw(`${env.apiPrefix}/admin/enquiries/export?${params.toString()}`, {
      Authorization: `Bearer ${token}`,
    });
    return new NextResponse(file.body, {
      status: 200,
      headers: {
        "Content-Type": file.contentType || "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="vmedia-enquiries.csv"',
        "X-Export-Truncated": file.header("x-export-truncated") ?? "false",
        "X-Export-Limit": file.header("x-export-limit") ?? "5000",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
