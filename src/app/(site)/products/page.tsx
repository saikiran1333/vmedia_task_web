import type { Metadata } from "next";
import { listOccasions } from "@/features/catalog/application/get-catalog";
import { parseCatalogSearchParams } from "@/features/catalog/domain/catalog-query";
import { listProducts } from "@/features/catalog/application/get-catalog";
import { CatalogBrowser } from "@/features/catalog/presentation/catalog-browser";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description: "Search and filter TribeGreen corporate gifts by category, occasion, and budget.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseCatalogSearchParams(await searchParams);
  const [state, occasions] = await Promise.all([listProducts(filters), listOccasions()]);
  return (
    <div className="tg-wrap tg-section">
      <h1 className="tg-display">All products</h1>
      <p className="tg-muted">Filter the live catalogue. Prices are shown in rupees.</p>
      <CatalogBrowser
        initialFilters={filters}
        initialState={state}
        occasions={occasions.status === "ready" ? occasions.data : []}
      />
    </div>
  );
}
