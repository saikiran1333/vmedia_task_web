export const ENQUIRY_BUDGETS = [
  "Under ₹200 per gift",
  "₹200 \u2013 ₹500 per gift",
  "₹500 \u2013 ₹1,000 per gift",
  "₹1,000 \u2013 ₹2,500 per gift",
  "₹2,500+ per gift",
  "Flexible / Not sure",
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRODUCT_ID_PATTERN = /^tg-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const KEY_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

export type EnquiryDraft = {
  name: string;
  email: string;
  phone: string;
  city: string;
  companyName: string;
  occasion: string;
  budget: string;
  message: string;
  units: string;
  items: { productId: string; quantity: string }[];
  customisationOptions: string[];
  customisationRequirements: string;
  deliveryDate: string;
};

export type EnquiryBody = {
  name: string;
  email: string;
  phone: string;
  city: string;
  companyName?: string;
  occasion: string;
  budget: string;
  message: string;
  source: "WEBSITE";
  units?: number;
  items?: { productId: string; quantity: number }[];
  customisationOptions?: string[];
  customisationRequirements?: string;
  deliveryDate?: string;
};

export type EnquiryValidation =
  | { ok: true; body: EnquiryBody }
  | { ok: false; errors: { field: string; message: string }[] };

export function normalizeIndianMobile(input: string) {
  const compact = input.replace(/[\s()-]/g, "");
  let national = compact;
  if (national.startsWith("+91")) national = national.slice(3);
  else if (national.startsWith("91") && national.length === 12) national = national.slice(2);
  else if (national.startsWith("0") && national.length === 11) national = national.slice(1);
  if (!/^[6-9]\d{9}$/.test(national)) return null;
  return `+91${national}`;
}

export function kolkataToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function isRealDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((accumulator, key) => {
        const next = (value as Record<string, unknown>)[key];
        if (next !== undefined) accumulator[key] = canonical(next);
        return accumulator;
      }, {});
  }
  return value;
}

export function enquiryFingerprint(body: EnquiryBody) {
  return JSON.stringify(canonical(body));
}

export function resolveIdempotencyKey(
  stored: { key: string; fingerprint: string } | null,
  fingerprint: string,
) {
  if (stored && stored.fingerprint === fingerprint && KEY_PATTERN.test(stored.key)) return stored;
  return { key: crypto.randomUUID(), fingerprint };
}

export function validateEnquiry(
  draft: EnquiryDraft,
  allowed: { occasions: string[]; customisations: string[]; productIds: string[] },
): EnquiryValidation {
  const errors: { field: string; message: string }[] = [];
  const name = draft.name.trim();
  if (name.length < 2 || name.length > 80) errors.push({ field: "name", message: "Enter a name between 2 and 80 characters." });

  const email = draft.email.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    errors.push({ field: "email", message: "Enter a valid email address." });
  }

  const phone = normalizeIndianMobile(draft.phone.trim());
  if (!phone) errors.push({ field: "phone", message: "Enter a valid Indian mobile number." });

  const city = draft.city.trim();
  if (city.length < 2 || city.length > 80) errors.push({ field: "city", message: "Enter a city between 2 and 80 characters." });

  const companyName = draft.companyName.trim();
  if (companyName.length > 120) errors.push({ field: "companyName", message: "Company name must be 120 characters or fewer." });

  const occasion = draft.occasion.trim();
  if (!occasion || !allowed.occasions.includes(occasion)) {
    errors.push({ field: "occasion", message: "Choose an occasion from the list." });
  }

  const budget = draft.budget.trim();
  if (!ENQUIRY_BUDGETS.includes(budget as (typeof ENQUIRY_BUDGETS)[number])) {
    errors.push({ field: "budget", message: "Choose a budget from the list." });
  }

  const message = draft.message.trim();
  if (message.length < 10 || message.length > 2000) {
    errors.push({ field: "message", message: "Enter a message between 10 and 2000 characters." });
  }

  const requirements = draft.customisationRequirements.trim();
  if (requirements.length > 2000) {
    errors.push({
      field: "customisationRequirements",
      message: "Customisation requirements must be 2000 characters or fewer.",
    });
  }

  const options = draft.customisationOptions.map((option) => option.trim()).filter(Boolean);
  if (options.some((option) => !allowed.customisations.includes(option)) || new Set(options).size !== options.length) {
    errors.push({ field: "customisationOptions", message: "Choose a customisation option from the list." });
  }

  let deliveryDate = draft.deliveryDate.trim();
  if (deliveryDate) {
    if (!isRealDate(deliveryDate)) errors.push({ field: "deliveryDate", message: "Enter a delivery date as YYYY-MM-DD." });
    else if (deliveryDate < kolkataToday()) {
      errors.push({ field: "deliveryDate", message: "Delivery date cannot be in the past." });
    }
  }

  const items: { productId: string; quantity: number }[] = [];
  if (draft.items.length > 30) errors.push({ field: "items", message: "An enquiry can include at most 30 products." });
  draft.items.forEach((item, index) => {
    const productId = item.productId.trim();
    if (!PRODUCT_ID_PATTERN.test(productId) || (allowed.productIds.length > 0 && !allowed.productIds.includes(productId))) {
      errors.push({ field: "items", message: "Choose a product from the catalogue." });
      return;
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
      errors.push({ field: `items.${index}.quantity`, message: "Quantity must be a whole number from 1 to 10000." });
      return;
    }
    items.push({ productId, quantity });
  });
  if (new Set(items.map((item) => item.productId)).size !== items.length) {
    errors.push({ field: "items", message: "Each product can appear once. Add the quantities together." });
  }

  let units: number | null = null;
  if (items.length === 0) {
    const parsed = Number(draft.units);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100000) {
      errors.push({ field: "units", message: "Enter the number of gifts as a whole number." });
    } else units = parsed;
  } else {
    units = items.reduce((sum, item) => sum + item.quantity, 0);
    if (units > 100000) errors.push({ field: "units", message: "The combined quantity is too large." });
  }

  if (errors.length || !phone) return { ok: false, errors };

  const body: EnquiryBody = {
    name,
    email,
    phone,
    city,
    occasion,
    budget,
    message,
    source: "WEBSITE",
  };
  if (companyName) body.companyName = companyName;
  if (items.length) {
    body.items = items.sort((left, right) => left.productId.localeCompare(right.productId));
    body.units = units ?? undefined;
  } else if (units != null) body.units = units;
  if (options.length) body.customisationOptions = [...new Set(options)].sort();
  if (requirements) body.customisationRequirements = requirements;
  if (deliveryDate) body.deliveryDate = deliveryDate;
  return { ok: true, body };
}
