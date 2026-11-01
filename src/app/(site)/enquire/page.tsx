import type { Metadata } from "next";
import { listCustomisations, listOccasions, listProducts } from "@/features/catalog/application/get-catalog";
import { emptyCatalogFilters } from "@/features/catalog/domain/catalog-query";
import { EnquiryForm } from "@/features/enquiries/presentation/enquiry-form";
import { StateMessage } from "@/features/catalog/presentation/state-message";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corporate enquiry",
  description: "Send a TribeGreen corporate gifting enquiry with your occasion, budget, and selected products.",
  alternates: { canonical: "/enquire" },
};

export default async function EnquirePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const productId = typeof params.productId === "string" ? params.productId : "";
  const quantity = typeof params.quantity === "string" ? params.quantity : "1";
  const [occasions, products, customisations] = await Promise.all([
    listOccasions(),
    listProducts({ ...emptyCatalogFilters(), pageSize: 100, sort: "name" }),
    listCustomisations(),
  ]);

  if (occasions.status === "error") {
    return (
      <div className="tg-wrap tg-section">
        <h1 className="tg-display">Corporate enquiry</h1>
        <StateMessage {...occasions} />
      </div>
    );
  }

  return (
    <div className="tg-wrap tg-section">
      <h1 className="tg-display">Corporate enquiry</h1>
      <p className="tg-muted">Tell us what you need. Payment is not collected here.</p>
      <EnquiryForm
        occasions={occasions.data}
        products={products.status === "ready" ? products.data.items : []}
        customisations={customisations.status === "ready" ? customisations.data : []}
        productNote={
          products.status === "error"
            ? "The product list could not be loaded. You can still send an enquiry without selecting products."
            : null
        }
        initialProductId={productId}
        initialQuantity={quantity}
      />
    </div>
  );
}
