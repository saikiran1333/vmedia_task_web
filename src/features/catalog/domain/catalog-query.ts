export const CATALOGUE_CATEGORIES = ["Drinkware", "Apparel", "Work Essentials", "Wellness"] as const;

export const CATALOGUE_BUDGETS = [
  "Under ₹500",
  "₹500 to ₹1,500",
  "₹1,500 to ₹3,000",
  "Above ₹3,000",
] as const;

export const CATALOGUE_SORTS = ["name", "price", "newest", "updated"] as const;
export const CATALOGUE_ORDERS = ["asc", "desc"] as const;

export const CATALOGUE_PAGE_SIZE = 12;

export type CatalogFilters = {
  q: string;
  category: string;
  occasion: string;
  budget: string;
  sort: string;
  order: string;
  page: number;
  pageSize: number;
  justIn: boolean;
  fastSelling: boolean;
};

type SearchInput = URLSearchParams | Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function read(input: SearchInput, key: string) {
  if (input instanceof URLSearchParams) return input.get(key) ?? "";
  return first(input[key]);
}

export function emptyCatalogFilters(): CatalogFilters {
  return {
    q: "",
    category: "",
    occasion: "",
    budget: "",
    sort: "name",
    order: "asc",
    page: 1,
    pageSize: CATALOGUE_PAGE_SIZE,
    justIn: false,
    fastSelling: false,
  };
}

export function parseCatalogSearchParams(input: SearchInput): CatalogFilters {
  const filters = emptyCatalogFilters();
  filters.q = read(input, "q").trim().slice(0, 80);
  filters.category = read(input, "category").trim();
  filters.occasion = read(input, "occasion").trim();
  filters.budget = read(input, "budget").trim();
  const sort = read(input, "sort").trim();
  const order = read(input, "order").trim().toLowerCase();
  filters.sort = sort || "name";
  filters.order = order || "asc";
  const page = Number(read(input, "page") || "1");
  filters.page = Number.isInteger(page) && page > 0 ? page : 1;
  const pageSize = Number(read(input, "pageSize") || String(CATALOGUE_PAGE_SIZE));
  filters.pageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : CATALOGUE_PAGE_SIZE;
  filters.justIn = read(input, "justIn") === "true";
  filters.fastSelling = read(input, "fastSelling") === "true";
  return filters;
}

export function catalogSearchParams(filters: CatalogFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.occasion) params.set("occasion", filters.occasion);
  if (filters.budget) params.set("budget", filters.budget);
  if (filters.sort && filters.sort !== "name") params.set("sort", filters.sort);
  if (filters.order && filters.order !== "asc") params.set("order", filters.order);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize !== CATALOGUE_PAGE_SIZE) params.set("pageSize", String(filters.pageSize));
  if (filters.justIn) params.set("justIn", "true");
  if (filters.fastSelling) params.set("fastSelling", "true");
  return params;
}

export function catalogPath(filters: CatalogFilters) {
  const params = catalogSearchParams(filters);
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export class LatestRequest {
  private current = 0;

  start() {
    this.current += 1;
    return this.current;
  }

  isCurrent(id: number) {
    return id === this.current;
  }
}
