"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UnitId } from "@/content/schema";

export type InquiryLine = {
  slug: string;
  quantity: number;
  unit: UnitId;
};

type InquiryState = {
  lines: InquiryLine[];
  hydrated: boolean;
  add: (line: InquiryLine) => void;
  setQuantity: (slug: string, quantity: number) => void;
  setUnit: (slug: string, unit: UnitId) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

export const MAX_QUANTITY = 999_999;

/**
 * The list holds product slugs and quantities only, never display names, so it
 * survives a language switch intact and renders correctly in whichever locale
 * the buyer is reading when they submit.
 */
export const useInquiry = create<InquiryState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,

      add: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.slug === line.slug);
          if (!existing) return { lines: [...state.lines, line] };
          // Adding the same product again tops up the quantity rather than
          // silently doing nothing or creating a duplicate row.
          return {
            lines: state.lines.map((l) =>
              l.slug === line.slug
                ? {
                    ...l,
                    unit: line.unit,
                    quantity: Math.min(
                      l.unit === line.unit ? l.quantity + line.quantity : line.quantity,
                      MAX_QUANTITY,
                    ),
                  }
                : l,
            ),
          };
        }),

      setQuantity: (slug, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.slug === slug
              ? { ...l, quantity: Math.max(1, Math.min(Math.round(quantity), MAX_QUANTITY)) }
              : l,
          ),
        })),

      setUnit: (slug, unit) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.slug === slug ? { ...l, unit } : l)),
        })),

      remove: (slug) => set((state) => ({ lines: state.lines.filter((l) => l.slug !== slug) })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: "fawal-inquiry",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

/** Guards against a server/client count mismatch on first paint. */
export function useInquiryCount(): number | null {
  const hydrated = useInquiry((s) => s.hydrated);
  const count = useInquiry((s) => s.lines.length);
  return hydrated ? count : null;
}
