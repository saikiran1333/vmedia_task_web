import { cache } from "react";
import { describeFailure } from "@/core/errors/api-error";
import { debugLog } from "@/core/logging/debug-log";
import type { CatalogFilters } from "@/features/catalog/domain/catalog-query";
import type { Category, NamedOption, Occasion, ProductDetail, ProductPage } from "@/features/catalog/domain/entities/product";
import type { CatalogRepository } from "@/features/catalog/domain/repositories/catalog-repository";

export type LoadState<T> =
  | { status: "ready"; data: T }
  | { status: "error"; title: string; detail: string; action: string };

async function repo(): Promise<CatalogRepository> {
  return (await import("@/core/composition/container")).catalogRepository;
}

function failed(scope: string, error: unknown): LoadState<never> {
  const failure = describeFailure(error);
  debugLog(scope, "failed", { title: failure.title });
  return { status: "error", ...failure };
}

export const listProducts = cache(async function listProducts(
  filters: CatalogFilters,
  repository?: CatalogRepository,
): Promise<LoadState<ProductPage>> {
  try {
    const data = await (repository ?? (await repo())).list(filters);
    debugLog("catalog", "list", { total: data.total, page: data.page });
    return { status: "ready", data };
  } catch (error) {
    return failed("catalog", error);
  }
});

export const getProduct = cache(async function getProduct(
  id: string,
  repository?: CatalogRepository,
): Promise<LoadState<ProductDetail>> {
  try {
    const data = await (repository ?? (await repo())).getById(id);
    debugLog("catalog", "detail", { id: data.id });
    return { status: "ready", data };
  } catch (error) {
    return failed("catalog", error);
  }
});

export const listCategories = cache(async function listCategories(
  repository?: CatalogRepository,
): Promise<LoadState<Category[]>> {
  try {
    const data = await (repository ?? (await repo())).categories();
    return { status: "ready", data };
  } catch (error) {
    return failed("catalog", error);
  }
});

export const listOccasions = cache(async function listOccasions(
  repository?: CatalogRepository,
): Promise<LoadState<Occasion[]>> {
  try {
    const data = await (repository ?? (await repo())).occasions();
    return { status: "ready", data };
  } catch (error) {
    return failed("catalog", error);
  }
});

export const listCustomisations = cache(async function listCustomisations(
  repository?: CatalogRepository,
): Promise<LoadState<NamedOption[]>> {
  try {
    const data = await (repository ?? (await repo())).customisationOptions();
    return { status: "ready", data };
  } catch (error) {
    return failed("catalog", error);
  }
});
