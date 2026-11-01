import Link from "next/link";
import type { LoadState } from "@/features/catalog/application/get-catalog";
import { categoryImage, type Category, type ProductPage } from "@/features/catalog/domain/entities/product";
import { HeroCarousel } from "@/features/catalog/presentation/hero-carousel";
import { ProductGrid } from "@/features/catalog/presentation/product-card";
import { StateMessage } from "@/features/catalog/presentation/state-message";

const steps = [
  ["First Thought", "You share the occasion, the people, and the number of gifts."],
  ["Concept & Curation", "Gifts are chosen from the catalogue around your budget and branding."],
  ["Refinement & Approval", "You review the selection and the customisation before production."],
  ["Production & Packaging", "Approved gifts are prepared and packed for the handover."],
  ["Final Gift Delivery", "The finished gifts are delivered for your team, clients, or event."],
];

const benefits = [
  ["One enquiry", "Send the brief from the website. TribeGreen confirms it with an enquiry number."],
  ["Branding options", "Logo printing, laser engraving, and name personalisation can be requested where the product offers them."],
  ["A live catalogue", "Names, prices, and images come from the Vmedia catalogue API."],
  ["A direct reply", "Enquiry email is answered within 24 working hours."],
];

function ProductBand({
  title,
  intro,
  href,
  state,
}: {
  title: string;
  intro: string;
  href: string;
  state: LoadState<ProductPage>;
}) {
  return (
    <section className="tg-section">
      <div className="tg-row" style={{ justifyContent: "space-between" }}>
        <div>
          <h2 className="tg-title">{title}</h2>
          <p className="tg-muted">{intro}</p>
        </div>
        <Link href={href} className="tg-button-secondary">
          View all
        </Link>
      </div>
      {state.status === "error" ? <StateMessage {...state} /> : null}
      {state.status === "ready" && state.data.total === 0 ? (
        <p className="tg-muted">Nothing is listed in this group right now.</p>
      ) : null}
      {state.status === "ready" && state.data.items.length > 0 ? <ProductGrid products={state.data.items} /> : null}
    </section>
  );
}

export function HomeView({
  categories,
  justIn,
  fastSelling,
}: {
  categories: LoadState<Category[]>;
  justIn: LoadState<ProductPage>;
  fastSelling: LoadState<ProductPage>;
}) {
  return (
    <div className="tg-wrap">
      <div className="tg-section">
        <HeroCarousel />
      </div>

      <section className="tg-section">
        <h2 className="tg-title">Product categories</h2>
        {categories.status === "error" ? <StateMessage {...categories} /> : null}
        {categories.status === "ready" ? (
          <div className="tg-category-grid">
            {categories.data.map((category) => {
              const image = categoryImage(category.name);
              return (
                <Link key={category.name} href={`/products?category=${encodeURIComponent(category.name)}`} className="tg-category-tile">
                  {image ? <img src={image} alt="" /> : <span className="tg-image-fallback">Image unavailable</span>}
                  <span>
                    <strong>{category.name}</strong>
                    <span className="tg-muted">{category.productCount} products</span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>

      <ProductBand
        title="Just in"
        intro="Products marked just in by the catalogue."
        href="/products?justIn=true&sort=newest&order=desc"
        state={justIn}
      />
      <ProductBand
        title="Fast selling"
        intro="Products marked fast selling by the catalogue."
        href="/products?fastSelling=true"
        state={fastSelling}
      />

      <section className="tg-section">
        <p className="tg-kicker">Curate. Connect. Celebrate.</p>
        <h2 className="tg-title">How a corporate gift comes together</h2>
        <ol className="tg-process">
          {steps.map(([title, text], index) => (
            <li key={title} className="tg-step">
              <strong>0{index + 1}</strong>
              <h3>{title}</h3>
              <p className="tg-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="tg-section">
        <h2 className="tg-title">Why teams enquire here</h2>
        <div className="tg-benefit-grid">
          {benefits.map(([title, text]) => (
            <article key={title} className="tg-benefit">
              <h3>{title}</h3>
              <p className="tg-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tg-section">
        <div className="tg-band">
          <h2 className="tg-title">Plan a corporate gift</h2>
          <p className="tg-muted">Share the occasion, city, quantity, and budget. The enquiry is saved and you receive a reference number.</p>
          <Link href="/enquire" className="tg-button">
            Send an enquiry
          </Link>
        </div>
      </section>

      <section className="tg-section">
        <h2 className="tg-title">Clients and press</h2>
        <div className="tg-logo-row">
          {["logo-01.jpg", "logo-02.jpg", "logo-03.jpg", "nhance-logo.jpg", "client-17.webp"].map((file) => (
            <img key={file} src={`/assets/clients/${file}`} alt="Corporate client logo" />
          ))}
        </div>
        <div className="tg-press-row" style={{ marginTop: 16 }}>
          <img src="/assets/press/the-hindu.png" alt="The Hindu" />
          <img src="/assets/press/economic-times.avif" alt="The Economic Times" />
          <img src="/assets/press/businessworld.webp" alt="BW Businessworld" />
          <img src="/assets/press/fe-leisure.avif" alt="FE Leisure" />
        </div>
      </section>
    </div>
  );
}
