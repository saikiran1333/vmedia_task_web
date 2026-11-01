import type { Metadata } from "next";
import { listCategories, listProducts } from "@/features/catalog/application/get-catalog";
import { emptyCatalogFilters } from "@/features/catalog/domain/catalog-query";
import { HomeView } from "@/features/catalog/presentation/home-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corporate gifting",
  description: "Just in and fast selling corporate gifts from the TribeGreen catalogue, with a direct enquiry.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "TribeGreen corporate gifting",
    description: "Just in and fast selling corporate gifts, with a direct enquiry.",
    images: ["/assets/banners/home-banner-tablet.webp"],
  },
};

export default async function Page() {
  const base = emptyCatalogFilters();
  const [categories, justIn, fastSelling] = await Promise.all([
    listCategories(),
    listProducts({ ...base, justIn: true, sort: "newest", order: "desc", pageSize: 4 }),
    listProducts({ ...base, fastSelling: true, pageSize: 4 }),
  ]);
  return <HomeView categories={categories} justIn={justIn} fastSelling={fastSelling} />;
}
