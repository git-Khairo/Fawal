import { Changa, Mada, Chivo_Mono } from "next/font/google";

/**
 * Display. Angular, flat cut terminals, slightly compressed. It reads as
 * stamped or milled rather than drawn, and its Arabic strokes carry the same
 * bent-rod geometry as the products themselves.
 */
export const display = Changa({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-face",
  display: "swap",
});

/**
 * Body and UI. Squared geometric, industrial without being cold, and one of the
 * few families that holds up at 13px in both scripts.
 */
export const body = Mada({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body-face",
  display: "swap",
});

/** Gauges, quantities, phone numbers, reference codes. Machined, not techy. */
export const mono = Chivo_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-face",
  display: "swap",
});

export const fontVariables = `${display.variable} ${body.variable} ${mono.variable}`;
