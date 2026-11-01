import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME } from "@/core/auth/admin-gate";
import { ApiError, describeFailure } from "@/core/errors/api-error";
import type { EnquiryDetail, EnquiryListPage, StatusCounts } from "@/features/admin/domain/entities/enquiry";
import type { EnquiryFilters } from "@/features/admin/domain/enquiry-query";
import { ENQUIRY_STATUSES } from "@/features/admin/domain/enquiry-query";
import type { LoadState } from "@/features/catalog/application/get-catalog";

async function repository() {
  return (await import("@/core/composition/container")).adminRepository;
}

export async function readAdminToken() {
  return (await cookies()).get(ADMIN_COOKIE_NAME)?.value ?? "";
}

export async function requireAdmin() {
  const token = await readAdminToken();
  if (!token) redirect("/admin/login");
  try {
    const admin = await (await repository()).me(token);
    return { token, admin, forbidden: null as string | null };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) {
      redirect("/api/admin/session/end?reason=expired");
    }
    if (error instanceof ApiError && (error.statusCode === 403 || error.statusCode === 503)) {
      return { token, admin: null, forbidden: error.message };
    }
    const failure = describeFailure(error);
    return { token, admin: null, forbidden: failure.detail };
  }
}

export const listAdminEnquiries = cache(async function listAdminEnquiries(
  token: string,
  filters: EnquiryFilters,
): Promise<LoadState<EnquiryListPage>> {
  try {
    const data = await (await repository()).list(token, filters);
    return { status: "ready", data };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) redirect("/api/admin/session/end?reason=expired");
    const failure = describeFailure(error);
    return { status: "error", ...failure };
  }
});

export const getAdminEnquiry = cache(async function getAdminEnquiry(
  token: string,
  id: string,
): Promise<LoadState<EnquiryDetail>> {
  try {
    const data = await (await repository()).getById(token, id);
    return { status: "ready", data };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) redirect("/api/admin/session/end?reason=expired");
    const failure = describeFailure(error);
    return { status: "error", ...failure };
  }
});

export async function loadStatusCounts(token: string): Promise<LoadState<StatusCounts>> {
  try {
    const repo = await repository();
    const [total, ...counts] = await Promise.all([
      repo.count(token, {}),
      ...ENQUIRY_STATUSES.map((status) => repo.count(token, { status })),
    ]);
    return {
      status: "ready",
      data: {
        total,
        NEW: counts[0] ?? 0,
        CONTACTED: counts[1] ?? 0,
        CONVERTED: counts[2] ?? 0,
        LOST: counts[3] ?? 0,
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) redirect("/api/admin/session/end?reason=expired");
    const failure = describeFailure(error);
    return { status: "error", ...failure };
  }
}
