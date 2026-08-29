import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Entry on scroll. Pure CSS, so this stays a server component and ships no
 * JavaScript. See the .reveal rules in globals.css for why the element is
 * visible by default rather than starting hidden.
 */
export function Reveal({
  children,
  step = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  /** 0, 1 or 2. Staggers an item within a grid by shifting its scroll range. */
  step?: 0 | 1 | 2;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  return (
    <Tag className={cn("reveal", step === 1 && "reveal-1", step === 2 && "reveal-2", className)}>
      {children}
    </Tag>
  );
}
