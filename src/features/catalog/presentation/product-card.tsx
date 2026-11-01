import Link from "next/link";
import { assetUrl, formatRupees, type ProductSummary } from "@/features/catalog/domain/entities/product";
import { ProductImage } from "@/features/catalog/presentation/product-image";

export function ProductCard({ product }: { product: ProductSummary }) {
  const image = assetUrl(product.imageKey);
  const price = formatRupees(product.displayedPrice);
  const original = formatRupees(product.originalPrice);
  return (
    <article className="tg-product-card">
      <Link href={`/products/${product.id}`} className="tg-media-link">
        <ProductImage src={image} alt={product.name} sizes="(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 25vw" />
      </Link>
      <div className="tg-card-body">
        <p className="tg-muted" style={{ margin: 0, fontSize: "0.875rem" }}>
          {product.category ?? "Catalogue"}
        </p>
        <h3>
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="tg-price">
          {price ?? "Price on request"}
          {original ? <s>{original}</s> : null}
        </p>
        <Link href={`/products/${product.id}`} className="tg-button-secondary">
          View details
        </Link>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  return (
    <div className="tg-product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
