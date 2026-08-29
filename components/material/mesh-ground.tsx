import { cn } from "@/lib/cn";

/**
 * The expanded metal diamond, tiled as a CSS background.
 *
 * Taken from two places at once: the chain link behind the FT monogram in the
 * logo, and the شبك ممدد product itself. Used sparingly so it stays a signature
 * rather than wallpaper.
 *
 * Drawn as a data URI rather than an inline <svg> with <defs>: pattern
 * definitions need ids, and ids repeated across instances are invalid markup.
 * This also renders as one painted layer instead of an extra SVG subtree.
 */

/** Fixed light zinc. Intensity is controlled by `opacity`, never by hue. */
const STROKE = "#c8d0d8";

function tile(scale: number, height: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${scale}" height="${height}">` +
    `<path d="M${scale / 2} 0 L${scale} ${height / 2} L${scale / 2} ${height} L0 ${height / 2} Z" ` +
    `fill="none" stroke="${STROKE}" stroke-width="1"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function MeshGround({
  className,
  scale = 44,
  opacity = 0.05,
}: {
  className?: string;
  scale?: number;
  opacity?: number;
}) {
  const height = Math.round(scale * 0.6);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        opacity,
        backgroundImage: tile(scale, height),
        backgroundSize: `${scale}px ${height}px`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
