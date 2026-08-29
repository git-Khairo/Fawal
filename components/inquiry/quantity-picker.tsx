"use client";

import { useId, useState } from "react";
import { useInquiry, MAX_QUANTITY } from "@/lib/cart-store";
import { Button } from "@/components/material/button";
import { Plus, Check } from "@phosphor-icons/react/dist/ssr";
import type { UnitId } from "@/content/schema";

/**
 * Quantity and unit chosen together, then added in one action. Two separate
 * steps would let a buyer add "5" without ever saying five of what.
 */
export function QuantityPicker({
  slug,
  units,
  unitLabels,
  labels,
}: {
  slug: string;
  units: UnitId[];
  unitLabels: Record<string, string>;
  labels: { quantity: string; unit: string; add: string; added: string };
}) {
  const id = useId();
  const add = useInquiry((s) => s.add);
  const inList = useInquiry((s) => s.lines.some((l) => l.slug === slug));

  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<UnitId>(units[0]);
  const [justAdded, setJustAdded] = useState(false);

  const parsed = Number.parseInt(quantity, 10);
  const valid = Number.isFinite(parsed) && parsed >= 1 && parsed <= MAX_QUANTITY;

  function onAdd() {
    if (!valid) return;
    add({ slug, unit, quantity: parsed });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  }

  const confirmed = justAdded || inList;

  return (
    <div className="plate rounded-[--radius-plate] border border-hairline p-5">
      <div className="flex gap-3">
        <div className="w-28">
          <label htmlFor={`${id}-qty`} className="mb-2 block text-xs font-medium text-ink-2">
            {labels.quantity}
          </label>
          <input
            id={`${id}-qty`}
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_QUANTITY}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="num plate-inset w-full rounded-[--radius-tile] border border-hairline px-3 py-3 text-sm text-ink transition-colors duration-200 focus:border-edge"
          />
        </div>

        <div className="flex-1">
          <label htmlFor={`${id}-unit`} className="mb-2 block text-xs font-medium text-ink-2">
            {labels.unit}
          </label>
          <select
            id={`${id}-unit`}
            value={unit}
            onChange={(e) => setUnit(e.target.value as UnitId)}
            className="plate-inset w-full rounded-[--radius-tile] border border-hairline px-3 py-3 text-sm text-ink transition-colors duration-200 focus:border-edge"
          >
            {units.map((u) => (
              <option key={u} value={u} className="bg-raised text-ink">
                {unitLabels[u]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="button" onClick={onAdd} disabled={!valid} className="mt-4 w-full">
        {confirmed ? (
          <Check size={15} weight="bold" aria-hidden="true" />
        ) : (
          <Plus size={15} weight="bold" aria-hidden="true" />
        )}
        <span>{confirmed ? labels.added : labels.add}</span>
      </Button>
    </div>
  );
}
