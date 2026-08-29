"use client";

import { cn } from "@/lib/cn";
import type { StateId } from "./model/wire-state";

export type ProductChoice = {
  id: StateId;
  /** Catalogue slug, so the CTA can link to the real product page. */
  slug: string;
  name: string;
};

/**
 * The list of forms. A radiogroup rather than a set of buttons, because the six
 * are mutually exclusive views of one thing, and that is what a screen reader
 * should be told.
 */
export function ProductSelector({
  items,
  activeId,
  onSelect,
  className,
  label,
}: {
  items: ProductChoice[];
  activeId: StateId;
  onSelect: (id: StateId) => void;
  className?: string;
  label: string;
}) {
  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const next = (index + (forward ? 1 : -1) + items.length) % items.length;
    onSelect(items[next].id);
    const el = document.getElementById(`form-${items[next].id}`);
    el?.focus();
  }

  return (
    <ul role="radiogroup" aria-label={label} className={cn("w-full", className)}>
      {items.map((item, i) => {
        const active = item.id === activeId;
        return (
          <li key={item.id} className="border-b border-hairline first:border-t">
            <button
              id={`form-${item.id}`}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(item.id)}
              onFocus={() => onSelect(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className="group flex w-full items-baseline gap-4 py-4 text-start transition-colors duration-300 lg:gap-6 lg:py-5"
            >
              <span
                className={cn(
                  "num w-6 shrink-0 text-[11px] tabular-nums transition-colors duration-300",
                  active ? "text-patina" : "text-ink-3",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "font-display text-xl font-semibold transition-colors duration-300 lg:text-3xl",
                  active ? "text-ink" : "text-ink-3 group-hover:text-ink-2",
                )}
              >
                {item.name}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
