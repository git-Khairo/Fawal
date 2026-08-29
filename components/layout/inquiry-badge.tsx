"use client";

import Link from "next/link";
import { ClipboardText } from "@phosphor-icons/react/dist/ssr";
import { useInquiryCount } from "@/lib/cart-store";
import { cn } from "@/lib/cn";

/**
 * The count is null until the persisted list has rehydrated, which keeps the
 * server and client markup identical on first paint.
 *
 * Below `sm` the label is replaced by an icon. Spelled out, "قائمة الاستفسار"
 * wraps to two lines on a 375px screen and doubles the height of the header.
 */
export function InquiryBadge({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const count = useInquiryCount();

  return (
    <Link
      href={href}
      // Without this the name computes as "قائمة الاستفسار1", with the count
      // glued to the label. The badge itself is a visual affordance only.
      aria-label={count ? `${label} (${count})` : label}
      className={cn(
        "specular inline-flex items-center gap-2 whitespace-nowrap rounded-[--radius-tile]",
        "border border-hairline px-3 py-2 text-xs font-medium text-ink sm:px-4",
        "transition-colors duration-200 hover:border-edge",
        count ? "border-patina-deep" : "",
        className,
      )}
    >
      <ClipboardText size={16} aria-hidden="true" className="sm:hidden" />
      <span className="hidden sm:inline">{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          "num inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] tabular-nums",
          count ? "bg-patina text-void font-semibold" : "bg-inset text-ink-3",
        )}
      >
        {count ?? 0}
      </span>
    </Link>
  );
}
