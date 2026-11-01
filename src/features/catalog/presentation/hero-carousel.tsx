"use client";

import { useState } from "react";
import Link from "next/link";

const slides = [
  {
    src: "/assets/banners/home-banner-tablet.webp",
    alt: "TribeGreen corporate gifting banner",
    kicker: "Corporate gifting",
    title: "Gifts that carry your name",
    text: "Browse the live catalogue and send an enquiry. A person from TribeGreen follows up. There is no checkout.",
    href: "/enquire",
    cta: "Start an enquiry",
  },
  {
    src: "/assets/banners/sign-in-banner.jpg",
    alt: "Promotional TribeGreen banner",
    kicker: "Curate. Connect. Celebrate.",
    title: "From the first idea to the handover",
    text: "Tell us the occasion, the number of gifts, and the budget. We reply by email within 24 working hours.",
    href: "/products",
    cta: "Browse the catalogue",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const slide = slides[index] ?? slides[0];

  function move(direction: number) {
    setIndex((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <section className="tg-hero" aria-roledescription="carousel" aria-label="Promotions">
      <div className="tg-hero-slide">
        {failed[index] ? null : (
          <img src={slide.src} alt="" onError={() => setFailed((current) => ({ ...current, [index]: true }))} />
        )}
        <div className="tg-hero-copy">
          <p className="tg-kicker" style={{ color: "white" }}>
            {slide.kicker}
          </p>
          <h1>{slide.title}</h1>
          <p>{slide.text}</p>
          <div className="tg-row">
            <Link href={slide.href} className="tg-button">
              {slide.cta}
            </Link>
          </div>
        </div>
      </div>
      <div className="tg-hero-controls">
        <button type="button" className="tg-icon-button" onClick={() => move(-1)} aria-label="Previous promotion">
          Previous
        </button>
        <button type="button" className="tg-icon-button" onClick={() => move(1)} aria-label="Next promotion">
          Next
        </button>
        <p className="tg-muted" aria-live="polite" style={{ margin: 0 }}>
          Slide {index + 1} of {slides.length}. {slide.alt}
        </p>
      </div>
    </section>
  );
}
