"use client";

import { ButtonLink } from "@/components/material/button";
import { cn } from "@/lib/cn";

/**
 * The typography and actions, revealed in three beats after the material has
 * already begun telling the story. Object, then transformation, then company.
 *
 * `data-shown` drives a clip-path wipe with a specular band behind it. The
 * wordmark is split into two whole words and never into letters, because Arabic
 * is cursive and splitting a word destroys its shaping.
 */
export function HeroContent({
  phase,
  armed,
  wordmarkA,
  wordmarkB,
  years,
  tagline,
  primary,
  secondary,
  primaryHref,
  secondaryHref,
  className,
}: {
  /** 0 nothing, 1 wordmark, 2 supporting line, 3 actions. */
  phase: number;
  /** True once the client has taken over and the wipe is safe to apply. */
  armed: boolean;
  wordmarkA: string;
  wordmarkB: string;
  years: string;
  tagline: string;
  primary: string;
  secondary: string;
  primaryHref: string;
  secondaryHref: string;
  className?: string;
}) {
  return (
    <div data-hero-armed={armed} className={cn("relative z-10", className)}>
      <h1 className="font-display font-semibold leading-[0.94] tracking-tight text-ink">
        <span
          className="hero-reveal inline-block whitespace-nowrap text-[clamp(2.75rem,13vw,7.5rem)]"
          data-shown={phase >= 1}
        >
          {wordmarkA}
        </span>
        <span className="sr-only"> </span>
        <span
          className="hero-reveal block whitespace-nowrap text-[clamp(2.75rem,13vw,7.5rem)] text-ink-2"
          data-shown={phase >= 1}
          style={{ animationDelay: "180ms" }}
        >
          {wordmarkB}
        </span>
      </h1>

      <p
        className="hero-reveal mt-6 max-w-[42ch] text-sm text-ink-2 sm:text-base lg:mt-8"
        data-shown={phase >= 2}
      >
        {years}
      </p>
      <p
        className="hero-reveal mt-1.5 max-w-[42ch] text-[13px] text-ink-3 sm:text-sm"
        data-shown={phase >= 2}
        style={{ animationDelay: "140ms" }}
      >
        {tagline}
      </p>

      <div
        className={cn(
          "mt-9 flex flex-wrap gap-3 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:mt-11",
          phase >= 3 ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ButtonLink href={primaryHref}>{primary}</ButtonLink>
        <ButtonLink href={secondaryHref} variant="secondary">
          {secondary}
        </ButtonLink>
      </div>
    </div>
  );
}
