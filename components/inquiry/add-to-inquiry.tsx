"use client";

import { useState } from "react";
import { Plus, Check } from "@phosphor-icons/react/dist/ssr";
import { useInquiry } from "@/lib/cart-store";
import { Button } from "@/components/material/button";
import type { UnitId } from "@/content/schema";
import { cn } from "@/lib/cn";

/**
 * Adding is not a navigation, so it must acknowledge itself in place. The label
 * flips to the confirmed state for a moment, then returns, which tells the buyer
 * it worked without pulling them out of the grid they are scanning.
 */
export function AddToInquiry({
  slug,
  unit,
  quantity = 1,
  addLabel,
  addedLabel,
  className,
  variant = "secondary",
}: {
  slug: string;
  unit: UnitId;
  quantity?: number;
  addLabel: string;
  addedLabel: string;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const add = useInquiry((s) => s.add);
  const inList = useInquiry((s) => s.lines.some((l) => l.slug === slug));
  const [justAdded, setJustAdded] = useState(false);

  function onAdd() {
    add({ slug, unit, quantity });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  const showConfirmed = justAdded || inList;

  return (
    <Button
      type="button"
      variant={variant}
      onClick={onAdd}
      aria-live="polite"
      className={cn("w-full", className)}
    >
      {showConfirmed ? (
        <Check size={15} weight="bold" aria-hidden="true" className="text-patina" />
      ) : (
        <Plus size={15} weight="bold" aria-hidden="true" />
      )}
      <span>{showConfirmed ? addedLabel : addLabel}</span>
    </Button>
  );
}
