"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { ProductTile, type CatalogItem } from "./product-tile";
import { Button } from "@/components/material/button";
import { plural, type PluralForms } from "@/lib/plural";
import type { Locale } from "@/content/schema";
import { cn } from "@/lib/cn";

export type FilterLabels = {
  searchLabel: string;
  searchPlaceholder: string;
  filterLabel: string;
  allCategories: string;
  count: PluralForms;
  emptyTitle: string;
  emptyBody: string;
  clearFilters: string;
  add: string;
  added: string;
  pending: string;
  details: string;
};

/**
 * Search and category filtering run in the browser over a list of thirteen
 * products. A round trip per keystroke would be slower and would cost the buyer
 * bandwidth for no benefit at this catalogue size.
 */
export function ProductFilters({
  items,
  categories,
  locale,
  labels,
}: {
  items: CatalogItem[];
  categories: { slug: string; name: string }[];
  locale: Locale;
  labels: FilterLabels;
}) {
  // ?category= and ?field= seed the filters. Reading them here rather than in
  // the page keeps the page itself prerenderable.
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(
    () => searchParams.get("category"),
  );
  const [field, setField] = useState<string | null>(() => searchParams.get("field"));

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category && item.category !== category) return false;
      if (field && !item.families.includes(field)) return false;
      if (needle && !item.searchIndex.includes(needle)) return false;
      return true;
    });
  }, [items, query, category, field]);

  const isFiltered = Boolean(query.trim() || category || field);

  function clear() {
    setQuery("");
    setCategory(null);
    setField(null);
  }

  return (
    <>
      <div className="flex flex-col gap-5 border-b border-hairline pb-7">
        <div className="relative max-w-md">
          <label htmlFor="product-search" className="mb-2 block text-xs font-medium text-ink-2">
            {labels.searchLabel}
          </label>
          <div className="relative">
            <MagnifyingGlass
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-3 start-3.5"
            />
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="plate-inset w-full rounded-[--radius-tile] border border-hairline py-3 text-sm text-ink ps-10 pe-3 transition-colors duration-200 focus:border-edge"
            />
          </div>
        </div>

        <div>
          <p id="category-filter-label" className="mb-2.5 text-xs font-medium text-ink-2">
            {labels.filterLabel}
          </p>
          <div role="group" aria-labelledby="category-filter-label" className="flex flex-wrap gap-2">
            {/* Only reads as "all" when nothing at all is narrowing the list.
                A field filter from the home page narrows it too, and showing
                this chip lit while four of twelve products are visible would
                be a lie. Clicking it clears both. */}
            <FilterChip
              active={category === null && field === null}
              onClick={() => {
                setCategory(null);
                setField(null);
              }}
            >
              {labels.allCategories}
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                active={category === c.slug}
                onClick={() => setCategory(category === c.slug ? null : c.slug)}
              >
                {c.name}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-6">
        <p className="num text-xs text-ink-3" aria-live="polite">
          {plural(locale, filtered.length, labels.count).replace(
            "{n}",
            String(filtered.length),
          )}
        </p>
        {isFiltered ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 text-xs text-ink-2 transition-colors duration-200 hover:text-ink"
          >
            <X size={13} weight="bold" aria-hidden="true" />
            {labels.clearFilters}
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="plate flex flex-col items-center gap-3 rounded-[--radius-plate] border border-hairline px-6 py-20 text-center">
          <h2 className="font-display text-lg font-semibold text-ink">{labels.emptyTitle}</h2>
          <p className="max-w-[40ch] text-sm text-ink-3">{labels.emptyBody}</p>
          <Button type="button" variant="secondary" onClick={clear} className="mt-3 w-auto">
            {labels.clearFilters}
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <li key={item.slug}>
              <ProductTile
                item={item}
                locale={locale}
                labels={{
                  add: labels.add,
                  added: labels.added,
                  pending: labels.pending,
                  details: labels.details,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-[--radius-tile] border px-3.5 py-2 text-xs transition-colors duration-200",
        active
          ? "border-patina-deep bg-patina-wash text-ink font-medium"
          : "border-hairline text-ink-2 hover:border-edge hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
