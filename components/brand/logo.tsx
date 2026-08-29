"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * The FT monogram, traced from the company's existing logo: one continuous bent
 * tube that reads as both an F and a T. Drawn as vector so it stays crisp and
 * can be lit from above like every other metal surface on the site.
 *
 * The original artwork is a raster with a dark teal serif wordmark on white,
 * which cannot sit on a dark ground. If the client supplies the source vector,
 * swap this component's paths for it and nothing else changes.
 */
export function LogoMark({ className }: { className?: string }) {
  // useId, not a module counter: a counter yields different values on the
  // server and the client, which React reports as a hydration mismatch.
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 100 56"
      fill="none"
      aria-hidden="true"
      className={cn("block h-auto", className)}
    >
      <defs>
        {/* One light source, from above, matching the bevel rule in globals.css. */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-spec-hi)" />
          <stop offset="55%" stopColor="var(--color-ink-2)" />
          <stop offset="100%" stopColor="var(--color-ink-3)" />
        </linearGradient>
      </defs>
      <g
        stroke={`url(#${gradientId})`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* F stem, rounded top corner, and the shared top bar. */}
        <path d="M10 46 L10 17 A9 9 0 0 1 19 8 L95 8" />
        {/* T stem, rounded bottom corner, and the bottom return. */}
        <path d="M72 8 L72 34 A9 9 0 0 1 63 43 L10 43" />
        {/* The middle arm of the F. */}
        <path d="M10 37 A9 9 0 0 1 19 28 L41 28" />
      </g>
    </svg>
  );
}

export function Logo({
  name,
  tagline,
  className,
}: {
  name: string;
  tagline?: string;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark className="w-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
          {name}
        </span>
        {tagline ? (
          <span className="mt-1 text-[10px] leading-tight text-ink-3">{tagline}</span>
        ) : null}
      </span>
    </span>
  );
}
