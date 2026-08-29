import { z } from "zod";
import { LOCALES, UNITS } from "@/content/schema";

/** Loose on purpose: Syrian and regional numbers arrive in many shapes. */
const PHONE = /^[+\d][\d\s()\-.]{4,29}$/;

export const inquiryRequestSchema = z.object({
  locale: z.enum(LOCALES),
  name: z.string().trim().min(2).max(80),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().min(5).max(30).regex(PHONE),
  city: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  notes: z.string().trim().max(1200).optional().or(z.literal("")),
  lines: z
    .array(
      z.object({
        slug: z.string().min(1).max(64),
        quantity: z.number().int().min(1).max(999_999),
        unit: z.enum(UNITS),
      }),
    )
    .min(1)
    .max(40),
  /**
   * Honeypot. A real browser leaves this empty; most naive bots fill it.
   * Accepted by the schema on purpose, and judged in the route handler, so a
   * filled trap gets the same 200 as a success instead of a 400 that tells the
   * bot exactly which field gave it away.
   */
  website: z.string().max(200).optional(),
  /** When the form was first rendered, used to reject instant submissions. */
  startedAt: z.number().int().positive(),
});

export type InquiryRequest = z.infer<typeof inquiryRequestSchema>;

/** A human cannot read the form, type a phone number and submit inside 3 seconds. */
export const MIN_FILL_MS = 3000;
