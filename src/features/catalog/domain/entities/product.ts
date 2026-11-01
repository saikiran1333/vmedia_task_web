export type ProductSummary = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  displayedPrice: number | null;
  originalPrice: number | null;
  currency: string;
  budgetBand: string | null;
  imageKey: string | null;
  justIn: boolean;
  fastSelling: boolean;
  occasions: string[];
  customisationOptions: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProductDetail = ProductSummary & {
  description: string | null;
  shortDescription: string | null;
  galleryKeys: string[];
  priceMin: number | null;
  priceMax: number | null;
  siteCategories: string[];
  categoryReview: string | null;
  featured: boolean | null;
};

export type ProductPage = {
  items: ProductSummary[];
  page: number;
  pageSize: number;
  total: number;
  message: string;
};

export type Category = {
  name: string;
  productCount: number;
};

export type Occasion = {
  name: string | null;
  enquiryLabel: string;
  catalogueFilter: boolean;
};

export type NamedOption = {
  name: string;
};

export function assetUrl(imageKey: string | null | undefined) {
  if (!imageKey) return null;
  const clean = imageKey.replace(/^\/+/, "").replace(/^assets\//, "");
  if (!clean || clean.includes("..") || clean.startsWith("http")) return null;
  return `/assets/${clean}`;
}

export function formatRupees(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function priceLabel(product: {
  displayedPrice: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
}) {
  const min = product.priceMin ?? null;
  const max = product.priceMax ?? null;
  if (min != null && max != null && min !== max) {
    return `${formatRupees(min)} – ${formatRupees(max)}`;
  }
  return formatRupees(product.displayedPrice) ?? "Price on request";
}

export function formatWhen(iso: string | null | undefined) {
  if (!iso) return "Not recorded";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function formatDay(iso: string | null | undefined) {
  if (!iso) return "Not recorded";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

const CATEGORY_ART: Record<string, string> = {
  Drinkware: "/assets/categories/drinkware.webp",
  Apparel: "/assets/categories/apparel.webp",
  "Work Essentials": "/assets/categories/work-essentials.webp",
  Wellness: "/assets/categories/wellness.webp",
};

export function categoryImage(name: string) {
  return CATEGORY_ART[name] ?? null;
}
