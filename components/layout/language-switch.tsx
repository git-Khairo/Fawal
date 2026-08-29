"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

/**
 * Swaps the locale segment of the current path so the reader stays on the page
 * they were looking at. The choice is remembered so a later visit to the site
 * root does not bounce them back to the browser's guess.
 */
export function LanguageSwitch({
  locale,
  label,
  a11yLabel,
  className,
}: {
  locale: Locale;
  label: string;
  a11yLabel: string;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const next: Locale = locale === "ar" ? "en" : "ar";

  function switchTo() {
    const segments = pathname.split("/");
    if (LOCALES.includes(segments[1] as Locale)) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    document.cookie = `fawal-locale=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      router.push(segments.join("/") || `/${next}`);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={switchTo}
      lang={next}
      aria-label={a11yLabel}
      disabled={pending}
      className={cn(
        "rounded-[--radius-tile] border border-hairline px-3 py-2 text-xs font-medium text-ink-2",
        "transition-colors duration-200 hover:border-edge hover:text-ink disabled:opacity-50",
        className,
      )}
    >
      {label}
    </button>
  );
}
