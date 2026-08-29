import { MeshGround } from "./mesh-ground";
import { cn } from "@/lib/cn";

/**
 * The stand-in for a photograph that has not been supplied yet.
 *
 * Deliberately carries no text. Every place it appears already has the product
 * name immediately beside it, and repeating the name inside the frame reads as
 * an error state rather than as a considered blank. What it does carry is the
 * material language: a bevelled plate, the expanded metal lattice, and the same
 * light from above that every other surface on the site is lit by.
 */
export function MaterialFill({
  scale = 54,
  meshOpacity = 0.12,
  className,
  label,
}: {
  scale?: number;
  meshOpacity?: number;
  className?: string;
  /** Accessible name. Given, the plate is exposed as an image; omitted, it is decorative. */
  label?: string;
}) {
  // A fixed highlight washes out a small thumbnail, because the same gradient
  // covers eighty pixels as thoroughly as it covers a hero panel. Tie its
  // strength to the mesh scale, which already tracks how large the plate is.
  const highlight = scale >= 60 ? 0.14 : scale >= 44 ? 0.09 : 0.05;
  const semantics = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);

  return (
    <div className={cn("plate relative overflow-hidden", className)} {...semantics}>
      <MeshGround scale={scale} opacity={meshOpacity} />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(125% 95% at 78% 4%, oklch(0.88 0.006 225 / ${highlight}), transparent 62%)`,
        }}
      />
    </div>
  );
}
