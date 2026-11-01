import type { Metadata } from "next";
import { contact, whatsappHref } from "@/features/site/domain/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Phone, WhatsApp, email, and the Hyderabad studio address for TribeGreen corporate gifting.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="tg-wrap tg-section">
      <h1 className="tg-display">Contact TribeGreen</h1>
      <div className="tg-benefit-grid">
        <article className="tg-panel" style={{ padding: 16 }}>
          <h2>Call</h2>
          <p>
            <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a>
          </p>
          <p className="tg-muted">{contact.phoneHours}</p>
        </article>
        <article className="tg-panel" style={{ padding: 16 }}>
          <h2>WhatsApp</h2>
          <p>
            <a href={whatsappHref("Hello TribeGreen, I would like to enquire about corporate gifting.")}>
              {contact.whatsappDisplay}
            </a>
          </p>
          <p className="tg-muted">The contact page lists WhatsApp as the fastest reply.</p>
        </article>
        <article className="tg-panel" style={{ padding: 16 }}>
          <h2>Email</h2>
          <p>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
          <p className="tg-muted">Replies are sent within 24 working hours.</p>
          <p>
            Support: <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a>
          </p>
        </article>
        <article className="tg-panel" style={{ padding: 16 }}>
          <h2>Studio</h2>
          {contact.addressLines.map((line) => (
            <p key={line} style={{ margin: "4px 0" }}>
              {line}
            </p>
          ))}
          <p className="tg-muted">{contact.officeHours}</p>
        </article>
      </div>
    </div>
  );
}
