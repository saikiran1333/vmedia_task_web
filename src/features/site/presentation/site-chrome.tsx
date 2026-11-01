"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/features/catalog/domain/entities/product";
import { contact, whatsappHref } from "@/features/site/domain/contact";

export function SiteHeader({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const q = String(data.get("q") ?? "").trim();
    if (!q) {
      event.preventDefault();
      window.location.href = "/products";
    }
  }

  const links = [
    { href: "/products", label: "All products" },
    ...categories.map((category) => ({
      href: `/products?category=${encodeURIComponent(category.name)}`,
      label: category.name,
    })),
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="tg-header">
      <div className="tg-topbar">
        <div className="tg-topbar-inner">
          <p>Corporate gifting for teams, clients, and celebrations.</p>
          <ul>
            <li>
              <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a>
            </li>
            <li>
              <a href={whatsappHref("Hello TribeGreen, I would like to enquire about corporate gifting.")}>WhatsApp</a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="tg-header-row">
        <Link href="/" className="tg-logo" aria-label="TribeGreen home">
          <img src="/assets/logo/tribegreen-logo.png" alt="TribeGreen" />
        </Link>
        <form className="tg-search tg-search-desktop" action="/products" method="get" role="search" onSubmit={onSearch}>
          <label className="tg-sr" htmlFor="catalogue-search">
            Search products
          </label>
          <input id="catalogue-search" name="q" type="search" maxLength={80} placeholder="Search products" />
        </form>
        <div className="tg-header-actions">
          <Link href="/enquire" className="tg-button">
            Enquire
          </Link>
          <button
            type="button"
            className="tg-menu-button tg-icon-button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
        </div>
      </div>
      <div id={panelId} className="tg-panel" data-open={open ? "true" : "false"}>
        <nav className="tg-nav" aria-label="Catalogue">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        <form className="tg-search tg-search-mobile tg-wrap" action="/products" method="get" role="search">
          <label htmlFor="catalogue-search-mobile" className="tg-field">
            Search products
            <input id="catalogue-search-mobile" name="q" type="search" maxLength={80} placeholder="Search products" />
          </label>
        </form>
      </div>
    </header>
  );
}

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="tg-footer">
      <div className="tg-wrap tg-footer-grid">
        <div>
          <h2>Contact</h2>
          <p className="tg-muted">
            {contact.addressLines.map((line) => (
              <span key={line} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </p>
          <p>
            <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a>
          </p>
          <p>
            <a href={whatsappHref("Hello TribeGreen, I would like to enquire about corporate gifting.")}>
              WhatsApp {contact.whatsappDisplay}
            </a>
          </p>
          <p>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
          <p className="tg-muted">{contact.officeHours}</p>
        </div>
        <div>
          <h2>Explore</h2>
          <ul>
            <li>
              <Link href="/products">All products</Link>
            </li>
            <li>
              <Link href="/enquire">Corporate enquiry</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            {categories.map((category) => (
              <li key={category.name}>
                <Link href={`/products?category=${encodeURIComponent(category.name)}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Policies</h2>
          <ul>
            <li>
              <a href={contact.termsUrl} target="_blank" rel="noopener noreferrer">
                Terms and conditions
              </a>
            </li>
            <li>
              <a href={contact.grievanceUrl} target="_blank" rel="noopener noreferrer">
                Contact and grievance redressal
              </a>
            </li>
          </ul>
          <p className="tg-muted">{contact.legalEntity}</p>
        </div>
      </div>
    </footer>
  );
}
