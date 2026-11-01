import { env } from "@/core/config/env";
import { ApiError } from "@/core/errors/api-error";
import { apiGet, type Envelope } from "@/core/network/api-client";
import { catalogSearchParams, type CatalogFilters } from "@/features/catalog/domain/catalog-query";
import type {
  Category,
  NamedOption,
  Occasion,
  ProductDetail,
  ProductPage,
  ProductSummary,
} from "@/features/catalog/domain/entities/product";
import type { CatalogRepository } from "@/features/catalog/domain/repositories/catalog-repository";

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function mapProductSummary(value: unknown): ProductSummary {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const id = text(row.id);
  if (!id) throw new ApiError("The catalogue response was missing a product id.", "parse");
  return {
    id,
    slug: text(row.slug),
    name: text(row.name, "Untitled product"),
    category: typeof row.category === "string" ? row.category : null,
    displayedPrice: numberOrNull(row.displayedPrice),
    originalPrice: numberOrNull(row.originalPrice),
    currency: text(row.currency, "INR"),
    budgetBand: typeof row.budgetBand === "string" ? row.budgetBand : null,
    imageKey: typeof row.imageKey === "string" ? row.imageKey : null,
    justIn: row.justIn === true,
    fastSelling: row.fastSelling === true,
    occasions: stringList(row.occasions),
    customisationOptions: stringList(row.customisationOptions),
    createdAt: text(row.createdAt),
    updatedAt: text(row.updatedAt),
  };
}

export function mapProductDetail(value: unknown): ProductDetail {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    ...mapProductSummary(value),
    description: typeof row.description === "string" ? row.description : null,
    shortDescription: typeof row.shortDescription === "string" ? row.shortDescription : null,
    galleryKeys: stringList(row.galleryKeys),
    priceMin: numberOrNull(row.priceMin),
    priceMax: numberOrNull(row.priceMax),
    siteCategories: stringList(row.siteCategories),
    categoryReview: typeof row.categoryReview === "string" ? row.categoryReview : null,
    featured: typeof row.featured === "boolean" ? row.featured : null,
  };
}

function mapPage(response: Envelope<unknown>): ProductPage {
  if (!Array.isArray(response.data)) {
    throw new ApiError("The catalogue response was not a product list.", "parse");
  }
  return {
    items: response.data.map(mapProductSummary),
    page: response.meta?.page ?? 1,
    pageSize: response.meta?.pageSize ?? response.data.length,
    total: response.meta?.total ?? response.data.length,
    message: response.message,
  };
}

export class CatalogRepositoryImpl implements CatalogRepository {
  async list(filters: CatalogFilters): Promise<ProductPage> {
    const params = catalogSearchParams(filters);
    if (filters.sort === "name") params.set("sort", "name");
    if (filters.order === "asc") params.set("order", "asc");
    params.set("page", String(filters.page));
    params.set("pageSize", String(filters.pageSize));
    const query = params.toString();
    const response = await apiGet<unknown>(`${env.apiPrefix}/products?${query}`);
    return mapPage(response);
  }

  async getById(id: string): Promise<ProductDetail> {
    const response = await apiGet<unknown>(`${env.apiPrefix}/products/${encodeURIComponent(id)}`);
    return mapProductDetail(response.data);
  }

  async categories(): Promise<Category[]> {
    const response = await apiGet<unknown>(`${env.apiPrefix}/categories`);
    if (!Array.isArray(response.data)) throw new ApiError("The category response was not a list.", "parse");
    return response.data
      .map((item) => {
        const row = item as Record<string, unknown>;
        return { name: text(row.name), productCount: numberOrNull(row.productCount) ?? 0 };
      })
      .filter((item) => item.name);
  }

  async occasions(): Promise<Occasion[]> {
    const response = await apiGet<unknown>(`${env.apiPrefix}/occasions`);
    if (!Array.isArray(response.data)) throw new ApiError("The occasion response was not a list.", "parse");
    return response.data
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          name: typeof row.name === "string" ? row.name : null,
          enquiryLabel: text(row.enquiryLabel),
          catalogueFilter: row.catalogueFilter === true,
        };
      })
      .filter((item) => item.enquiryLabel);
  }

  async customisationOptions(): Promise<NamedOption[]> {
    const response = await apiGet<unknown>(`${env.apiPrefix}/customisation-options`);
    if (!Array.isArray(response.data)) throw new ApiError("The customisation response was not a list.", "parse");
    return response.data
      .map((item) => ({ name: text((item as Record<string, unknown>).name) }))
      .filter((item) => item.name);
  }
}
