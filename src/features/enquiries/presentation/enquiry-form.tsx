"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { NamedOption, Occasion, ProductSummary } from "@/features/catalog/domain/entities/product";
import type { EnquiryReceipt } from "@/features/admin/domain/entities/enquiry";
import {
  ENQUIRY_BUDGETS,
  enquiryFingerprint,
  resolveIdempotencyKey,
  validateEnquiry,
  type EnquiryDraft,
} from "@/features/enquiries/domain/enquiry-validation";
import { formatDay } from "@/features/catalog/domain/entities/product";
import { contact } from "@/features/site/domain/contact";

const RECEIPT_KEY = "vmedia-enquiry-receipt";
const IDEMPOTENCY_KEY = "vmedia-enquiry-idempotency";

function readStoredKey() {
  try {
    const raw = sessionStorage.getItem(IDEMPOTENCY_KEY);
    return raw ? (JSON.parse(raw) as { key: string; fingerprint: string }) : null;
  } catch {
    return null;
  }
}

export function EnquiryForm({
  products,
  occasions,
  customisations,
  productNote,
  initialProductId,
  initialQuantity,
}: {
  products: ProductSummary[];
  occasions: Occasion[];
  customisations: NamedOption[];
  productNote: string | null;
  initialProductId: string;
  initialQuantity: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<EnquiryDraft>({
    name: "",
    email: "",
    phone: "",
    city: "",
    companyName: "",
    occasion: "",
    budget: "",
    message: "",
    units: "1",
    items: initialProductId ? [{ productId: initialProductId, quantity: initialQuantity || "1" }] : [],
    customisationOptions: [],
    customisationRequirements: "",
    deliveryDate: "",
  });
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const allowedOccasions = useMemo(
    () => occasions.flatMap((occasion) => [occasion.enquiryLabel, occasion.name].filter((value): value is string => Boolean(value))),
    [occasions],
  );
  const productIds = products.map((product) => product.id);
  const unitsFromItems = draft.items.reduce((sum, item) => sum + (Number.isInteger(Number(item.quantity)) ? Number(item.quantity) : 0), 0);

  function errorFor(field: string) {
    return errors.find((error) => error.field === field)?.message;
  }

  function setField<K extends keyof EnquiryDraft>(key: K, value: EnquiryDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setFormError("");
    const result = validateEnquiry(draft, {
      occasions: allowedOccasions,
      customisations: customisations.map((option) => option.name),
      productIds,
    });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    const selected = result.body.items ?? [];
    const unsupported = result.body.customisationOptions?.filter((option) =>
      selected.some((item) => {
        const product = products.find((entry) => entry.id === item.productId);
        return product ? !product.customisationOptions.includes(option) : false;
      }),
    );
    if (unsupported && unsupported.length) {
      setErrors([{ field: "customisationOptions", message: "One of the selected products does not offer that customisation." }]);
      return;
    }
    setErrors([]);
    setPending(true);
    const fingerprint = enquiryFingerprint(result.body);
    const key = resolveIdempotencyKey(readStoredKey(), fingerprint);
    sessionStorage.setItem(IDEMPOTENCY_KEY, JSON.stringify(key));
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ body: result.body, idempotencyKey: key.key }),
      });
      const payload = (await response.json()) as {
        message?: string;
        errors?: { field: string; message: string }[];
        receipt?: EnquiryReceipt;
      };
      if (response.status === 409) {
        sessionStorage.removeItem(IDEMPOTENCY_KEY);
        setFormError(payload.message || "This submission key was already used for a different enquiry. Review the form and send it again.");
        return;
      }
      if (!response.ok || !payload.receipt?.enquiryNumber) {
        if (payload.errors?.length) setErrors(payload.errors);
        setFormError(payload.message || "The enquiry was not saved. You can send it again.");
        return;
      }
      sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(payload.receipt));
      router.push("/enquire/thank-you");
    } catch {
      setFormError("The enquiry was not saved. Check your connection and send it again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="tg-panel" style={{ padding: 16, display: "grid", gap: 16 }} onSubmit={onSubmit} noValidate>
      {formError ? (
        <div className="tg-alert" role="alert">
          <p>{formError}</p>
        </div>
      ) : null}
      {productNote ? <p className="tg-muted">{productNote}</p> : null}
      <Field label="Name" error={errorFor("name")}>
        <input value={draft.name} onChange={(event) => setField("name", event.target.value)} autoComplete="name" required />
      </Field>
      <Field label="Email" error={errorFor("email")}>
        <input value={draft.email} onChange={(event) => setField("email", event.target.value)} autoComplete="email" inputMode="email" required />
      </Field>
      <Field label="Phone" error={errorFor("phone")} hint="Indian mobile number">
        <input value={draft.phone} onChange={(event) => setField("phone", event.target.value)} autoComplete="tel" inputMode="tel" required />
      </Field>
      <Field label="City" error={errorFor("city")}>
        <input value={draft.city} onChange={(event) => setField("city", event.target.value)} autoComplete="address-level2" required />
      </Field>
      <Field label="Company name" error={errorFor("companyName")} hint="Optional">
        <input value={draft.companyName} onChange={(event) => setField("companyName", event.target.value)} autoComplete="organization" />
      </Field>
      <Field label="Occasion" error={errorFor("occasion")}>
        <select value={draft.occasion} onChange={(event) => setField("occasion", event.target.value)} required>
          <option value="">Choose an occasion</option>
          {occasions.map((occasion) => (
            <option key={occasion.enquiryLabel} value={occasion.enquiryLabel}>
              {occasion.enquiryLabel}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Budget" error={errorFor("budget")}>
        <select value={draft.budget} onChange={(event) => setField("budget", event.target.value)} required>
          <option value="">Choose a budget</option>
          {ENQUIRY_BUDGETS.map((budget) => (
            <option key={budget}>{budget}</option>
          ))}
        </select>
      </Field>
      <Field label="Number of gifts" error={errorFor("units")} hint={draft.items.length ? "This matches the selected products." : "A whole number"}>
        {draft.items.length ? (
          <input value={String(unitsFromItems)} readOnly />
        ) : (
          <input value={draft.units} onChange={(event) => setField("units", event.target.value)} inputMode="numeric" required />
        )}
      </Field>
      <fieldset style={{ border: "1px solid var(--tg-border)", borderRadius: 12, padding: 16 }}>
        <legend>Products</legend>
        {draft.items.map((item, index) => {
          const product = products.find((entry) => entry.id === item.productId);
          return (
            <div key={`${item.productId}-${index}`} className="tg-row">
              <span>{product?.name ?? item.productId}</span>
              <label>
                Quantity
                <input
                  value={item.quantity}
                  inputMode="numeric"
                  onChange={(event) => {
                    const items = draft.items.slice();
                    items[index] = { ...item, quantity: event.target.value };
                    setField("items", items);
                  }}
                />
              </label>
              <button
                type="button"
                className="tg-button-secondary"
                onClick={() => setField("items", draft.items.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
              {errorFor(`items.${index}.quantity`) ? <p className="tg-error">{errorFor(`items.${index}.quantity`)}</p> : null}
            </div>
          );
        })}
        {errorFor("items") ? <p className="tg-error">{errorFor("items")}</p> : null}
        <ProductAdder
          products={products.filter((product) => !draft.items.some((item) => item.productId === product.id))}
          onAdd={(productId) => setField("items", [...draft.items, { productId, quantity: "1" }])}
        />
      </fieldset>
      {customisations.length ? (
        <fieldset style={{ border: "1px solid var(--tg-border)", borderRadius: 12, padding: 16 }}>
          <legend>Customisation</legend>
          {customisations.map((option) => (
            <label key={option.name} className="tg-check">
              <input
                type="checkbox"
                checked={draft.customisationOptions.includes(option.name)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...draft.customisationOptions, option.name]
                    : draft.customisationOptions.filter((name) => name !== option.name);
                  setField("customisationOptions", next);
                }}
              />
              {option.name}
            </label>
          ))}
          {errorFor("customisationOptions") ? <p className="tg-error">{errorFor("customisationOptions")}</p> : null}
        </fieldset>
      ) : null}
      <Field label="Customisation requirements" error={errorFor("customisationRequirements")} hint="Optional">
        <textarea value={draft.customisationRequirements} onChange={(event) => setField("customisationRequirements", event.target.value)} maxLength={2000} />
      </Field>
      <Field label="Delivery date" error={errorFor("deliveryDate")} hint="Optional">
        <input type="date" value={draft.deliveryDate} onChange={(event) => setField("deliveryDate", event.target.value)} />
      </Field>
      <Field label="Message" error={errorFor("message")}>
        <textarea value={draft.message} onChange={(event) => setField("message", event.target.value)} required minLength={10} maxLength={2000} />
      </Field>
      <button type="submit" className="tg-button" disabled={pending}>
        {pending ? "Sending enquiry…" : "Submit enquiry"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <label className="tg-field" htmlFor={id}>
      {label}
      {hint ? <span className="tg-muted">{hint}</span> : null}
      <span style={{ display: "contents" }}>{children}</span>
      {error ? (
        <span className="tg-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function ProductAdder({ products, onAdd }: { products: ProductSummary[]; onAdd: (id: string) => void }) {
  const [productId, setProductId] = useState("");
  if (!products.length) return <p className="tg-muted">All listed products are already on this enquiry, or the catalogue could not be loaded.</p>;
  return (
    <div className="tg-row">
      <label className="tg-field" style={{ flex: 1 }}>
        Add a product
        <select value={productId} onChange={(event) => setProductId(event.target.value)}>
          <option value="">Choose a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="tg-button-secondary"
        onClick={() => {
          if (!productId) return;
          onAdd(productId);
          setProductId("");
        }}
      >
        Add
      </button>
    </div>
  );
}

export function ThankYou() {
  const [receipt, setReceipt] = useState<EnquiryReceipt | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RECEIPT_KEY);
      setReceipt(raw ? (JSON.parse(raw) as EnquiryReceipt) : null);
    } catch {
      setReceipt(null);
    }
  }, []);

  if (receipt === undefined) return <p className="tg-muted">Checking the enquiry receipt…</p>;

  if (!receipt?.enquiryNumber) {
    return (
      <div className="tg-alert">
        <h1 className="tg-title">No confirmed enquiry on this device</h1>
        <p className="tg-muted">This page shows a reference only after the server accepts the enquiry.</p>
        <a className="tg-button" href="/enquire">
          Go to the enquiry form
        </a>
      </div>
    );
  }

  return (
    <div className="tg-band">
      <p className="tg-kicker">Enquiry received</p>
      <h1 className="tg-display">Thank you. Your enquiry is recorded.</h1>
      <p>
        Enquiry number <strong>{receipt.enquiryNumber}</strong>
      </p>
      <p>Submitted {formatDay(receipt.createdAt)}</p>
      <p className="tg-muted">
        Write to <a href={`mailto:${contact.email}`}>{contact.email}</a> or call{" "}
        <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a>. WhatsApp {contact.whatsappDisplay}.
      </p>
      <a className="tg-button" href="/products">
        Continue browsing
      </a>
    </div>
  );
}
