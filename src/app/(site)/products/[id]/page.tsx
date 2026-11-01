import type { Metadata } from "next";
import Link from "next/link";
import { getProduct, listProducts } from "@/features/catalog/application/get-catalog";
import { emptyCatalogFilters } from "@/features/catalog/domain/catalog-query";
import { ProductDetailView } from "@/features/catalog/presentation/product-detail-view";
import { StateMessage } from "@/features/catalog/presentation/state-message";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const state = await getProduct(id);
  if (state.status !== "ready") {
    return { title: "Product", description: "This product is not available in the catalogue." };
  }
  const image = state.data.imageKey ? `/assets/${state.data.imageKey.replace(/^\/+/, "").replace(/^assets\//, "")}` : undefined;
  return {
    title: state.data.name,
    description: (state.data.description ?? state.data.name).slice(0, 160),
    alternates: { canonical: `/products/${id}` },
    openGraph: {
      title: state.data.name,
      description: (state.data.description ?? state.data.name).slice(0, 160),
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const state = await getProduct(id);
  if (state.status === "error") {
    return (
      <div className="tg-wrap tg-section">
        <StateMessage {...state} />
        <p>
          <Link href="/products">Back to the catalogue</Link>
        </p>
      </div>
    );
  }
  let related = state.data.category
    ? await listProducts({ ...emptyCatalogFilters(), category: state.data.category, pageSize: 8 })
    : null;
  const relatedItems =
    related && related.status === "ready"
      ? related.data.items.filter((item) => item.id !== state.data.id).slice(0, 4)
      : [];
  return <ProductDetailView product={state.data} related={relatedItems} />;
}
