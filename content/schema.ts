import { z } from "zod";

/** The two locales the site ships in. Arabic is the default and the source of truth. */
export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Every user-visible string in the catalog carries both locales. */
export const localizedSchema = z.object({
  ar: z.string().min(1),
  en: z.string().min(1),
});
export type Localized = z.infer<typeof localizedSchema>;

/**
 * The three solution families the brochure organises the business around.
 * These group products by the job the buyer is doing, not by what they are made of.
 */
export const FAMILIES = ["stationery", "fencing", "construction"] as const;
export type FamilyId = (typeof FAMILIES)[number];

/** Units a buyer can request a quantity in. */
export const UNITS = ["ton", "kg", "roll", "meter", "sqmeter", "piece"] as const;
export type UnitId = (typeof UNITS)[number];

/**
 * A spec field is a dimension the product is quoted against, not a published value.
 * The brochure lists no gauges, diameters or coatings, so rather than invent them
 * we tell the buyer which details we need in order to price their order.
 */
export const SPEC_FIELDS = [
  "wireDiameter",
  "meshAperture",
  "sheetThickness",
  "barDiameter",
  "rollLength",
  "rollHeight",
  "coating",
  "tensileGrade",
  "spoolCount",
] as const;
export type SpecFieldId = (typeof SPEC_FIELDS)[number];

export const categorySchema = z.object({
  slug: z.string().min(1),
  name: localizedSchema,
  blurb: localizedSchema,
  image: z.string().min(1),
});
export type Category = z.infer<typeof categorySchema>;

export const familySchema = z.object({
  id: z.enum(FAMILIES),
  name: localizedSchema,
  blurb: localizedSchema,
  image: z.string().min(1),
});
export type Family = z.infer<typeof familySchema>;

export const productSchema = z.object({
  slug: z.string().min(1),
  name: localizedSchema,
  /** One sentence. What it is and what it is for. */
  summary: localizedSchema,
  category: z.string().min(1),
  families: z.array(z.enum(FAMILIES)).min(1),
  /** Details we need from the buyer before we can quote. */
  specFields: z.array(z.enum(SPEC_FIELDS)).min(1),
  /**
   * الأنواع. Variants within this line. General industry types, not a claim
   * that every one is stocked, so this needs the owner's review before launch.
   */
  variants: z.array(localizedSchema).default([]),
  /** الاستخدامات. Where the product is actually used. */
  applications: z.array(localizedSchema).default([]),
  /** Units this product is normally ordered in, most common first. */
  units: z.array(z.enum(UNITS)).min(1),
  image: z.string().min(1),
});
export type Product = z.infer<typeof productSchema>;
