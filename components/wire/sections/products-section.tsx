"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { ProductMorphScene } from "../ProductMorphScene";
import { ProductSelector, type ProductChoice } from "../ProductSelector";
import { STATE_ORDER, type StateId } from "../model/wire-state";
import { cn } from "@/lib/cn";

/** Keyed by wire state id. `slug` is the catalogue category, so the CTA lands on
 *  the filtered product list for that line rather than on a single item. */
export type ProductCopy = Record<string, { name: string; blurb: string; slug: string }>;

/**
 * The product stage. Selecting a form morphs the wire; it never swaps an image.
 *
 * Per the brief this pins only briefly, and the visitor drives the morphs
 * themselves rather than being carried through all six by scroll. The pinning
 * is added by the scroll layer; this component is just the composition.
 */
export function ProductsSection({
  copy,
  locale,
  title,
  body,
  ctaLabel,
  selectorLabel,
}: {
  copy: ProductCopy;
  locale: string;
  title: string;
  body: string;
  ctaLabel: string;
  selectorLabel: string;
}) {
  const [activeId, setActiveId] = useState<StateId>("metal-wire");
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const items: ProductChoice[] = STATE_ORDER.filter((id) => copy[id]).map((id) => ({
    id,
    slug: copy[id].slug,
    name: copy[id].name,
  }));

  const active = copy[activeId];

  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      className="relative border-b border-hairline"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-8 lg:py-28">
        <h2
          id="products-heading"
          className="max-w-[20ch] font-display text-3xl font-semibold tracking-tight text-ink lg:text-5xl"
        >
          {title}
        </h2>
        <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-ink-2">{body}</p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
          <div>
            <ProductSelector
              items={items}
              activeId={activeId}
              onSelect={setActiveId}
              label={selectorLabel}
            />

            {/* Reserved height so switching forms never reflows the column. */}
            <div className="mt-8 min-h-[7.5rem]">
              <p key={`${activeId}-blurb`} className="max-w-[46ch] text-sm leading-relaxed text-ink-2">
                {active.blurb}
              </p>
              <Link
                href={`/${locale}/products?category=${active.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-patina transition-colors duration-200 hover:text-ink"
              >
                {ctaLabel}
                <Arrow size={14} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div
            className={cn(
              "relative order-first aspect-square w-full lg:order-none",
              "lg:aspect-[4/3]",
            )}
          >
            <ProductMorphScene activeId={activeId} ariaLabel={active.name} />
          </div>
        </div>
      </div>
    </section>
  );
}
