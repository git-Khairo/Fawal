import { getProduct } from "@/content/catalog";
import { escapeHtml } from "@/lib/escape-html";
import type { Locale, UnitId } from "@/content/schema";

const HEADINGS = {
  ar: {
    title: "طلب عرض سعر جديد",
    customer: "الزبون",
    name: "الاسم",
    company: "الجهة",
    phone: "الهاتف",
    city: "المدينة",
    email: "البريد",
    items: "الأصناف",
    notes: "ملاحظات",
    via: "أُرسل من الموقع باللغة العربية",
  },
  en: {
    title: "New quote request",
    customer: "Customer",
    name: "Name",
    company: "Company",
    phone: "Phone",
    city: "City",
    email: "Email",
    items: "Products",
    notes: "Notes",
    via: "Sent from the website in English",
  },
} as const;

export type InquiryMessageInput = {
  name: string;
  company?: string;
  phone: string;
  city: string;
  email?: string;
  notes?: string;
  lines: { slug: string; quantity: number; unit: UnitId }[];
  locale: Locale;
};

/**
 * Builds the Telegram message body.
 *
 * Two rules hold throughout: every value that came from the buyer goes through
 * escapeHtml before it touches the string, and product names are looked up in
 * our own catalogue rather than taken from the request, so a tampered payload
 * cannot put arbitrary text or markup into the owner's chat.
 */
export function buildInquiryMessage(
  data: InquiryMessageInput,
  reference: string,
  unitLabels: Record<UnitId, string>,
  now: Date = new Date(),
): string {
  const h = HEADINGS[data.locale];
  const e = escapeHtml;

  const stamp = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Damascus",
    dateStyle: "short",
    timeStyle: "short",
  }).format(now);

  const items = data.lines
    .map((line, i) => {
      const product = getProduct(line.slug);
      const label = product ? product.name[data.locale] : line.slug;
      return `${i + 1}. ${e(label)}  <b>${line.quantity}</b> ${e(unitLabels[line.unit])}`;
    })
    .join("\n");

  const rows = [
    `${h.name}: <b>${e(data.name)}</b>`,
    data.company ? `${h.company}: ${e(data.company)}` : null,
    `${h.phone}: <a href="tel:${e(data.phone.replace(/\s/g, ""))}">${e(data.phone)}</a>`,
    `${h.city}: ${e(data.city)}`,
    data.email ? `${h.email}: ${e(data.email)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    `<b>${h.title}</b>`,
    `<code>${reference}</code>  ${stamp} Damascus`,
    "",
    `<b>${h.customer}</b>`,
    rows,
    "",
    `<b>${h.items}</b>`,
    items,
    data.notes ? `\n<b>${h.notes}</b>\n${e(data.notes)}` : "",
    `\n<i>${h.via}</i>`,
  ]
    .filter((part) => part !== "")
    .join("\n");
}
