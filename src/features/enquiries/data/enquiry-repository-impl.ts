import { env } from "@/core/config/env";
import { apiSend } from "@/core/network/api-client";
import type { EnquiryBody } from "@/features/enquiries/domain/enquiry-validation";
import type { EnquiryReceipt } from "@/features/admin/domain/entities/enquiry";

function mapReceipt(value: unknown): EnquiryReceipt {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    id: typeof row.id === "string" ? row.id : "",
    enquiryNumber: typeof row.enquiryNumber === "string" ? row.enquiryNumber : "",
    status: typeof row.status === "string" ? row.status : "",
    source: typeof row.source === "string" ? row.source : "",
    units: typeof row.units === "number" ? row.units : 0,
    createdAt: typeof row.createdAt === "string" ? row.createdAt : "",
  };
}

export class EnquiryRepositoryImpl {
  async create(body: EnquiryBody, idempotencyKey: string) {
    const response = await apiSend<unknown>(`${env.apiPrefix}/enquiries`, "POST", body, {
      "Idempotency-Key": idempotencyKey,
    });
    return { receipt: mapReceipt(response.data), message: response.message, statusCode: response.statusCode };
  }
}
