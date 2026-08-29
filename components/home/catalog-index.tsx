"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MaterialFill } from "@/components/material/material-fill";
import { cn } from "@/lib/cn";

export type IndexEntry = {
  slug: string;
  name: string;
  blurb: string;
  image: string | null;
};

/**
 * An index, not a card grid. Moving through the list swaps the large plate on
 * the opposite side, so the reader compares six lines without six boxes of
 * chrome between them.
 *
 * The swap is motivated: it ties a name to a material at the moment of reading.
 * Under 1024px there is no pointer to track, so it collapses to a plain grid.
 */
export function CatalogIndex({
  entries,
  title,
  body,
  locale,
  pendingLabel,
}: {
  entries: IndexEntry[];
  title: string;
  body: string;
  locale: string;
  pendingLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduce = useReducedMotion();
  const active = entries[activeIndex];

  return (
    <section className="border-b border-hairline bg-deck">
      <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-8 lg:py-28">
        <h2 className="max-w-[18ch] font-display text-3xl font-semibold tracking-tight text-ink lg:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-ink-3">{body}</p>

        <div className="mt-12 lg:grid lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-16">
          {/* The index. */}
          <ul className="hidden lg:block">
            {entries.map((entry, i) => (
              <li key={entry.slug} className="border-b border-hairline first:border-t">
                <Link
                  href={`/${locale}/products/${entry.slug}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onFocus={() => setActiveIndex(i)}
                  className="group flex items-baseline gap-5 py-6 transition-colors duration-300"
                >
                  <span
                    className={cn(
                      "num w-6 shrink-0 text-xs tabular-nums transition-colors duration-300",
                      i === activeIndex ? "text-patina" : "text-ink-3",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1">
                    <span
                      className={cn(
                        "block font-display text-2xl font-medium transition-colors duration-300",
                        i === activeIndex ? "text-ink" : "text-ink-2 group-hover:text-ink",
                      )}
                    >
                      {entry.name}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block max-w-[54ch] text-[13px] leading-relaxed transition-opacity duration-300",
                        i === activeIndex ? "text-ink-3 opacity-100" : "text-ink-3 opacity-60",
                      )}
                    >
                      {entry.blurb}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* The plate that follows the index. */}
          <div className="sticky top-[104px] hidden aspect-[4/5] lg:block">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.slug}
                initial={reduce ? false : { opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {active.image ? (
                  <Image
                    src={active.image}
                    alt=""
                    fill
                    sizes="42vw"
                    className="rounded-[--radius-plate] object-cover"
                  />
                ) : (
                  <MaterialFill
                    scale={72}
                    meshOpacity={0.15}
                    className="h-full w-full rounded-[--radius-plate]"
                    label={`${active.name}. ${pendingLabel}`}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Under 1024px: no pointer to follow, so the index becomes a plain grid. */}
          <ul className="grid grid-cols-2 gap-3 lg:hidden">
            {entries.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/${locale}/products/${entry.slug}`}
                  className="block overflow-hidden rounded-[--radius-plate] border border-hairline"
                >
                  <span className="relative block aspect-[4/3]">
                    {entry.image ? (
                      <Image
                        src={entry.image}
                        alt=""
                        fill
                        sizes="50vw"
                        className="object-cover"
                      />
                    ) : (
                      <MaterialFill scale={44} className="absolute inset-0" />
                    )}
                  </span>
                  <span className="block px-3.5 py-3 font-display text-[13px] font-medium text-ink">
                    {entry.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
