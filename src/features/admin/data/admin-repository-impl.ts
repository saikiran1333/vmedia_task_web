import { env } from "@/core/config/env";
import { ApiError } from "@/core/errors/api-error";
import { apiGet, apiSend } from "@/core/network/api-client";
import type {
  AdminProfile,
  EnquiryDetail,
  EnquiryListItem,
  EnquiryListPage,
} from "@/features/admin/domain/entities/enquiry";
import { enquirySearchParams, type EnquiryFilters } from "@/features/admin/domain/enquiry-query";

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function mapEnquiryListItem(value: unknown): EnquiryListItem {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    id: text(row.id),
    enquiryNumber: text(row.enquiryNumber),
    name: text(row.name),
    email: text(row.email),
    phone: text(row.phone),
    city: text(row.city),
    companyName: typeof row.companyName === "string" ? row.companyName : null,
    units: numberOrZero(row.units),
    occasion: text(row.occasion),
    occasionName: typeof row.occasionName === "string" ? row.occasionName : null,
    budget: text(row.budget),
    source: text(row.source),
    status: text(row.status),
    createdAt: text(row.createdAt),
    updatedAt: text(row.updatedAt),
    itemCount: numberOrZero(row.itemCount),
  };
}

export function mapEnquiryDetail(value: unknown): EnquiryDetail {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const items = Array.isArray(row.items) ? row.items : [];
  const events = Array.isArray(row.statusEvents) ? row.statusEvents : [];
  return {
    ...mapEnquiryListItem(value),
    deliveryDate: typeof row.deliveryDate === "string" ? row.deliveryDate : null,
    message: text(row.message),
    customisationRequirements: typeof row.customisationRequirements === "string" ? row.customisationRequirements : null,
    customisationOptions: Array.isArray(row.customisationOptions)
      ? row.customisationOptions.filter((item): item is string => typeof item === "string")
      : [],
    items: items.map((item) => {
      const entry = item as Record<string, unknown>;
      return {
        productId: text(entry.productId),
        productName: text(entry.productName),
        quantity: numberOrZero(entry.quantity),
        unitPrice: typeof entry.unitPrice === "number" ? entry.unitPrice : null,
      };
    }),
    statusEvents: events.map((event) => {
      const entry = event as Record<string, unknown>;
      return {
        fromStatus: typeof entry.fromStatus === "string" ? entry.fromStatus : null,
        toStatus: text(entry.toStatus),
        createdAt: text(entry.createdAt),
      };
    }),
  };
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export class AdminRepositoryImpl {
  async login(email: string, password: string) {
    const response = await apiSend<{ token?: string; admin?: AdminProfile }>(
      `${env.apiPrefix}/admin/auth/login`,
      "POST",
      { email, password },
    );
    const token = response.data?.token;
    const admin = response.data?.admin;
    if (!token || !admin?.id || !admin.email) {
      throw new ApiError("The sign-in response was incomplete.", "parse", response.statusCode);
    }
    return { token, admin: { id: admin.id, email: admin.email, name: admin.name ?? "" } };
  }

  async me(token: string) {
    const response = await apiGet<AdminProfile>(`${env.apiPrefix}/admin/auth/me`, auth(token));
    return response.data;
  }

  async list(token: string, filters: EnquiryFilters): Promise<EnquiryListPage> {
    const params = enquirySearchParams(filters, { paginate: true });
    const response = await apiGet<EnquiryListPage>(`${env.apiPrefix}/admin/enquiries?${params}`, auth(token));
    const data = response.data;
    return {
      items: Array.isArray(data?.items) ? data.items.map(mapEnquiryListItem) : [],
      page: data?.page ?? filters.page,
      pageSize: data?.pageSize ?? filters.pageSize,
      total: data?.total ?? 0,
    };
  }

  async count(token: string, filters: Partial<EnquiryFilters>) {
    const page = await this.list(token, {
      q: filters.q ?? "",
      status: filters.status ?? "",
      source: filters.source ?? "",
      occasion: filters.occasion ?? "",
      from: filters.from ?? "",
      to: filters.to ?? "",
      sort: "createdAt",
      order: "desc",
      page: 1,
      pageSize: 1,
    });
    return page.total;
  }

  async getById(token: string, id: string) {
    const response = await apiGet<unknown>(`${env.apiPrefix}/admin/enquiries/${encodeURIComponent(id)}`, auth(token));
    return mapEnquiryDetail(response.data);
  }

  async updateStatus(token: string, id: string, status: string) {
    const response = await apiSend<unknown>(
      `${env.apiPrefix}/admin/enquiries/${encodeURIComponent(id)}/status`,
      "PATCH",
      { status },
      auth(token),
    );
    return mapEnquiryDetail(response.data);
  }
}
