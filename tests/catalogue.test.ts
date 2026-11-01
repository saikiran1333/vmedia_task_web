import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { adminGate, safeNextPath, toPublicAdmin } from "../src/core/auth/admin-gate";
import { ApiError } from "../src/core/errors/api-error";
import { apiGet, apiSend } from "../src/core/network/api-client";
import { LatestRequest, catalogSearchParams, parseCatalogSearchParams } from "../src/features/catalog/domain/catalog-query";
import { assetUrl, formatRupees } from "../src/features/catalog/domain/entities/product";
import { mapProductDetail, mapProductSummary } from "../src/features/catalog/data/catalog-repository-impl";
import {
  enquiryFingerprint,
  normalizeIndianMobile,
  resolveIdempotencyKey,
  validateEnquiry,
  type EnquiryDraft,
} from "../src/features/enquiries/domain/enquiry-validation";
import { mapEnquiryListItem } from "../src/features/admin/data/admin-repository-impl";
import { csvHasDataRows, enquirySearchParams, isEnquiryStatus, parseEnquirySearchParams } from "../src/features/admin/domain/enquiry-query";

const draft = (overrides: Partial<EnquiryDraft> = {}): EnquiryDraft => ({
  name: "Asha Rao",
  email: "Asha@Example.com",
  phone: "9876543210",
  city: "Pune",
  companyName: "",
  occasion: "Corporate Diwali Gifting",
  budget: "Flexible / Not sure",
  message: "We need branded gifts for the Diwali dispatch.",
  units: "5",
  items: [],
  customisationOptions: [],
  customisationRequirements: "",
  deliveryDate: "",
  ...overrides,
});

const allowed = {
  occasions: ["Corporate Diwali Gifting"],
  customisations: ["Logo printing"],
  productIds: ["tg-7831", "tg-6657"],
};

describe("api client", () => {
  test("reads a success envelope and a field error", async () => {
    const original = globalThis.fetch;
    try {
      globalThis.fetch = async () =>
        new Response(JSON.stringify({ success: true, statusCode: 200, message: "Success", data: { ok: true } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      const body = await apiGet<{ ok: boolean }>("/api/v1/products");
      assert.equal(body.data.ok, true);

      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            success: false,
            statusCode: 400,
            message: "Enquiry could not be saved.",
            errors: [{ field: "email", message: "Enter a valid email address." }],
          }),
          { status: 400, headers: { "content-type": "application/json" } },
        );
      await assert.rejects(() => apiSend("/api/v1/enquiries", "POST", { email: "nope" }), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.fieldErrors[0]?.field, "email");
        return true;
      });
    } finally {
      globalThis.fetch = original;
    }
  });

  test("turns a timeout and a non-JSON body into ApiError", async () => {
    const original = globalThis.fetch;
    try {
      globalThis.fetch = (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        });
      await assert.rejects(() => apiGet("/api/v1/health", undefined, 20), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.kind, "timeout");
        return true;
      });

      globalThis.fetch = async () => new Response("<html></html>", { status: 502 });
      await assert.rejects(() => apiGet("/api/v1/health"), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.kind, "parse");
        return true;
      });
    } finally {
      globalThis.fetch = original;
    }
  });
});

describe("product listing and filters", () => {
  test("combines search, category, occasion, budget, sort, and flags", () => {
    const filters = parseCatalogSearchParams({
      q: " bottle ",
      category: "Drinkware",
      occasion: "Employee Onboarding",
      budget: "₹500 to ₹1,500",
      sort: "price",
      order: "desc",
      justIn: "true",
      page: "2",
    });
    const params = catalogSearchParams(filters);
    assert.equal(params.get("q"), "bottle");
    assert.equal(params.get("category"), "Drinkware");
    assert.equal(params.get("occasion"), "Employee Onboarding");
    assert.equal(params.get("budget"), "₹500 to ₹1,500");
    assert.equal(params.get("sort"), "price");
    assert.equal(params.get("order"), "desc");
    assert.equal(params.get("justIn"), "true");
    assert.equal(params.get("page"), "2");
  });

  test("maps a product summary and detail without inventing a price", () => {
    const summary = mapProductSummary({
      id: "tg-7831",
      slug: "caslay-organic-polo-t-shirt",
      name: "Caslay Organic Polo T-Shirt",
      category: "Apparel",
      displayedPrice: 950,
      originalPrice: 2299,
      currency: "INR",
      budgetBand: "₹500 to ₹1,500",
      imageKey: "products/caslay-organic-polo-t-shirt-01.webp",
      justIn: false,
      fastSelling: true,
      occasions: ["Corporate Diwali Gifting"],
      customisationOptions: ["Logo printing"],
      createdAt: "2026-10-10T07:30:38",
      updatedAt: "2026-10-14T13:31:46",
    });
    assert.equal(formatRupees(summary.displayedPrice), "₹950");
    assert.equal(assetUrl(summary.imageKey), "/assets/products/caslay-organic-polo-t-shirt-01.webp");
    assert.equal(assetUrl("https://tribegreengifts.com/a.webp"), null);
    const detail = mapProductDetail({ ...summary, description: "Soft cotton.", galleryKeys: ["products/caslay-organic-polo-t-shirt-02.webp"], priceMin: null });
    assert.equal(detail.galleryKeys.length, 1);
    assert.equal(detail.priceMin, null);
  });

  test("ignores an older catalogue response", () => {
    const guard = new LatestRequest();
    const first = guard.start();
    const second = guard.start();
    assert.equal(guard.isCurrent(first), false);
    assert.equal(guard.isCurrent(second), true);
  });
});

describe("enquiry validation, submission, and idempotency", () => {
  test("accepts an Indian mobile and rejects an invalid email", () => {
    assert.equal(normalizeIndianMobile("+91 98765 43210"), "+919876543210");
    assert.equal(normalizeIndianMobile("09876543210"), "+919876543210");
    const invalid = validateEnquiry(draft({ email: "not-an-email" }), allowed);
    assert.equal(invalid.ok, false);
    if (!invalid.ok) assert.equal(invalid.errors.some((error) => error.field === "email"), true);
  });

  test("builds a website enquiry and reuses the idempotency key for the same body", () => {
    const result = validateEnquiry(
      draft({
        units: "5",
        items: [
          { productId: "tg-7831", quantity: "2" },
          { productId: "tg-6657", quantity: "3" },
        ],
        customisationOptions: ["Logo printing"],
      }),
      allowed,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.body.source, "WEBSITE");
    assert.equal(result.body.units, 5);
    assert.equal(result.body.email, "asha@example.com");
    const fingerprint = enquiryFingerprint(result.body);
    const first = resolveIdempotencyKey(null, fingerprint);
    const second = resolveIdempotencyKey(first, fingerprint);
    assert.equal(second.key, first.key);
    const changed = resolveIdempotencyKey(first, enquiryFingerprint({ ...result.body, city: "Hyderabad" }));
    assert.notEqual(changed.key, first.key);
  });

  test("requires a positive gift count when no products are selected", () => {
    const result = validateEnquiry(draft({ units: "0" }), allowed);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.errors.some((error) => error.field === "units"), true);
  });
});

describe("admin login, protection, enquiries, status, and export", () => {
  test("login payload for the browser omits the token", () => {
    const admin = toPublicAdmin({ id: "1", email: "admin@example.com", name: "Admin", token: "secret-token" });
    assert.deepEqual(admin, { id: "1", email: "admin@example.com", name: "Admin" });
    assert.equal("token" in admin, false);
  });

  test("protected admin routes need a session cookie and next paths stay on the site", () => {
    assert.equal(adminGate("/admin/enquiries", false), "login");
    assert.equal(adminGate("/admin/enquiries", true), "allow");
    assert.equal(adminGate("/admin/login", false), "allow");
    assert.equal(adminGate("/products", false), "allow");
    assert.equal(safeNextPath("https://evil.example/admin"), "/admin");
    assert.equal(safeNextPath("/admin/enquiries"), "/admin/enquiries");
  });

  test("maps an enquiry row and keeps export filters free of pagination", () => {
    const item = mapEnquiryListItem({
      id: "50fb840a-2a2c-41fc-a0d1-aa201b82f960",
      enquiryNumber: "ENQ-20261101-0003",
      name: "Asha Rao",
      email: "asha@example.com",
      companyName: "Northwind Gifts",
      phone: "+919876543210",
      city: "Pune",
      units: 5,
      occasion: "Corporate Diwali Gifting",
      budget: "Flexible / Not sure",
      source: "WEBSITE",
      status: "NEW",
      createdAt: "2026-11-01T13:51:05.000Z",
      updatedAt: "2026-11-01T13:51:05.000Z",
      itemCount: 2,
    });
    assert.equal(item.enquiryNumber, "ENQ-20261101-0003");
    const filters = parseEnquirySearchParams({ q: "Asha", status: "NEW", page: "3" });
    const exported = enquirySearchParams(filters, { paginate: false });
    assert.equal(exported.get("q"), "Asha");
    assert.equal(exported.get("status"), "NEW");
    assert.equal(exported.has("page"), false);
    assert.equal(isEnquiryStatus("CONVERTED"), true);
    assert.equal(isEnquiryStatus("SHIPPED"), false);
    assert.equal(csvHasDataRows("\uFEFFEnquiry Number\nENQ-1"), true);
    assert.equal(csvHasDataRows("\uFEFFEnquiry Number"), false);
  });
});
