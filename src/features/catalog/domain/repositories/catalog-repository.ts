import type { Category, NamedOption, Occasion, ProductDetail, ProductPage, ProductSummary } from "../entities/product";
import type { CatalogFilters } from "../catalog-query";

export interface CatalogRepository {
  list(filters: CatalogFilters): Promise<ProductPage>;
  getById(id: string): Promise<ProductDetail>;
  categories(): Promise<Category[]>;
  occasions(): Promise<Occasion[]>;
  customisationOptions(): Promise<NamedOption[]>;
}
