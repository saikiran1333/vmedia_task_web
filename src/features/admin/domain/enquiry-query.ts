export const ENQUIRY_STATUSES = ["NEW", "CONTACTED", "CONVERTED", "LOST"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CONVERTED: "Converted",
  LOST: "Lost",
};

export function isEnquiryStatus(value: string): value is EnquiryStatus {
  return ENQUIRY_STATUSES.includes(value as EnquiryStatus);
}

export type EnquiryFilters = {
  q: string;
  status: string;
  source: string;
  occasion: string;
  from: string;
  to: string;
  sort: string;
  order: string;
  page: number;
  pageSize: number;
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

export function parseEnquirySearchParams(input: SearchInput): EnquiryFilters {
  const page = Number(read(input, "page") || "1");
  return {
    q: read(input, "q").trim().slice(0, 80),
    status: read(input, "status").trim(),
    source: read(input, "source").trim(),
    occasion: read(input, "occasion").trim(),
    from: read(input, "from").trim(),
    to: read(input, "to").trim(),
    sort: read(input, "sort").trim() || "createdAt",
    order: read(input, "order").trim().toLowerCase() || "desc",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: 20,
  };
}

export function enquirySearchParams(filters: EnquiryFilters, options: { paginate: boolean }) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.source) params.set("source", filters.source);
  if (filters.occasion) params.set("occasion", filters.occasion);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.sort && filters.sort !== "createdAt") params.set("sort", filters.sort);
  if (filters.order && filters.order !== "desc") params.set("order", filters.order);
  if (options.paginate) {
    params.set("page", String(filters.page));
    params.set("pageSize", String(filters.pageSize));
  }
  return params;
}

export function csvHasDataRows(text: string) {
  const lines = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter(Boolean);
  return lines.length > 1;
}
