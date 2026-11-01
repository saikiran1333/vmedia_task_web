import Link from "next/link";
import { assetUrl, formatRupees, priceLabel, type ProductDetail, type ProductSummary } from "@/features/catalog/domain/entities/product";
import { ProductGallery } from "@/features/catalog/presentation/product-gallery";
import { ProductGrid } from "@/features/catalog/presentation/product-card";
import { productWhatsappMessage, whatsappHref } from "@/features/site/domain/contact";

export function ProductDetailView({
  product,
  related,
}: {
  product: ProductDetail;
  related: ProductSummary[];
}) {
  const images = [product.imageKey, ...product.galleryKeys]
    .map((key) => assetUrl(key))
    .filter((src): src is string => Boolean(src))
    .map((src, index) => ({ src, alt: index === 0 ? product.name : `${product.name} image ${index + 1}` }));
  const original = formatRupees(product.originalPrice);

  return (
    <div className="tg-wrap tg-section">
      <p className="tg-muted">
        <Link href="/products">All products</Link>
        {product.category ? (
          <>
            {" / "}
            <Link href={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          </>
        ) : null}
      </p>
      <div className="tg-detail">
        <ProductGallery images={images} name={product.name} />
        <div>
          <h1 className="tg-display">{product.name}</h1>
          <p className="tg-price" style={{ fontSize: "1.25rem" }}>
            {priceLabel(product)}
            {original ? <s>{original}</s> : null}
          </p>
          {product.budgetBand ? <p className="tg-muted">Budget band: {product.budgetBand}</p> : null}
          {product.description ? <p style={{ lineHeight: 1.5 }}>{product.description}</p> : <p className="tg-muted">No description is published for this product.</p>}
          {product.shortDescription ? <p className="tg-muted">{product.shortDescription}</p> : null}
          <h2 className="tg-title" style={{ fontSize: "1.125rem" }}>Occasions</h2>
          {product.occasions.length ? (
            <ul className="tg-pills">
              {product.occasions.map((occasion) => (
                <li key={occasion}>{occasion}</li>
              ))}
            </ul>
          ) : (
            <p className="tg-muted">No occasions are listed for this product.</p>
          )}
          <h2 className="tg-title" style={{ fontSize: "1.125rem" }}>Customisation</h2>
          {product.customisationOptions.length ? (
            <ul>
              {product.customisationOptions.map((option) => (
                <li key={option}>{option}</li>
              ))}
            </ul>
          ) : (
            <p className="tg-muted">No customisation options are listed for this product.</p>
          )}
          {product.siteCategories.length ? (
            <p className="tg-muted">Also listed on the reference catalogue under {product.siteCategories.join(", ")}.</p>
          ) : null}
          <div className="tg-row">
            <Link href={`/enquire?productId=${encodeURIComponent(product.id)}`} className="tg-button">
              Enquire now
            </Link>
            <a className="tg-button-secondary" href={whatsappHref(productWhatsappMessage(product))}>
              WhatsApp enquiry
            </a>
          </div>
        </div>
      </div>
      {related.length ? (
        <section className="tg-section">
          <h2 className="tg-title">Related products</h2>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
