import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

/* Contrast against the surfaces they sit on:
   primary  void ink on patina        14.9:1
   secondary ink on raised            15.2:1
   ghost    ink-2 on base              9.4:1  */
const variants: Record<Variant, string> = {
  primary:
    "bg-patina text-void font-semibold shadow-[inset_0_1px_0_oklch(1_0_0/0.28),inset_0_-1px_0_oklch(0_0_0/0.22)] hover:bg-[oklch(0.80_0.098_178)] active:translate-y-px",
  secondary:
    "plate text-ink font-medium border border-hairline hover:border-edge active:translate-y-px",
  ghost:
    "text-ink-2 font-medium border border-hairline hover:text-ink hover:border-edge active:translate-y-px",
};

const base =
  "specular inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[--radius-tile] " +
  "px-5 py-3 text-sm leading-none transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "disabled:pointer-events-none disabled:opacity-45";

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
  ...rest
}: { href: string; variant?: Variant; children: ReactNode } & Omit<
  ComponentProps<typeof Link>,
  "href" | "children"
>) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: { variant?: Variant } & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
