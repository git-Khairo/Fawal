"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MetalScene } from "./MetalScene";
import { HeroContent } from "./HeroContent";

/**
 * The opening. Dark, then a wire, then mesh, then a structure, then the company.
 *
 * The visitor is never held: the page scrolls normally throughout. Scrolling
 * early does not cut the sequence off, it runs it faster, so nobody is punished
 * for being impatient and nobody misses the reveal.
 */
export function CinematicHero({
  copy,
  primaryHref,
  secondaryHref,
}: {
  copy: {
    wordmarkA: string;
    wordmarkB: string;
    years: string;
    tagline: string;
    primary: string;
    secondary: string;
  };
  primaryHref: string;
  secondaryHref: string;
}) {
  const skipRef = useRef(false);
  const [phase, setPhase] = useState(0);
  const [armed, setArmed] = useState(false);
  const timers = useRef<number[]>([]);

  // Layout effect, so the clip lands in the same commit as the first paint and
  // the words never flash before being hidden. Falls back to useEffect on the
  // server, where layout effects do not run.
  const useArm = typeof window === "undefined" ? useEffect : useLayoutEffect;
  useArm(() => {
    setArmed(true);
  }, []);

  const revealAll = useCallback(() => setPhase(3), []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // The content beats are deterministic, so they are scheduled rather than
    // read back from the render loop. Nothing here re-renders per frame.
    const at = (ms: number, value: number) =>
      window.setTimeout(() => setPhase((p) => Math.max(p, value)), ms);

    if (reduced.matches) {
      // Everything at once, on the next tick. Reduced motion asks for the
      // finished composition, not a shorter film.
      timers.current = [at(0, 3)];
      return () => timers.current.forEach(clearTimeout);
    }

    timers.current = [at(4350, 1), at(4750, 2), at(5050, 3)];

    function onIntent() {
      skipRef.current = true;
      // Running the film faster also has to bring the words forward with it.
      timers.current.forEach(clearTimeout);
      timers.current = [at(500, 1), at(760, 2), at(980, 3)];
      remove();
    }

    function remove() {
      window.removeEventListener("wheel", onIntent);
      window.removeEventListener("touchstart", onIntent);
      window.removeEventListener("keydown", onKey);
    }

    function onKey(e: KeyboardEvent) {
      if (["PageDown", "ArrowDown", " ", "End"].includes(e.key)) onIntent();
    }

    window.addEventListener("wheel", onIntent, { passive: true, once: false });
    window.addEventListener("touchstart", onIntent, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      timers.current.forEach(clearTimeout);
      remove();
    };
  }, []);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate min-h-[100dvh] overflow-hidden border-b border-hairline"
    >
      <div className="absolute inset-0 -z-10">
        <MetalScene skipRef={skipRef} onSettle={revealAll} />
      </div>

      {/* Two scrims, both under the type only, so the structure stays fully
          legible on the other side of the frame and the composition stays
          asymmetric. The directional one seats the type side in shadow; the
          radial one sits directly behind the words, which is what keeps the
          wordmark above AA where a bright wire crosses it. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,transparent_18%,var(--color-void)_82%)] rtl:bg-[linear-gradient(260deg,transparent_18%,var(--color-void)_82%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(80%_65%_at_18%_52%,var(--color-void)_18%,transparent_72%)] rtl:bg-[radial-gradient(80%_65%_at_82%_52%,var(--color-void)_18%,transparent_72%)]"
      />

      <div className="mx-auto flex min-h-[100dvh] max-w-[1400px] items-center px-5 pb-24 pt-28 lg:px-8">
        <div id="hero-heading">
          <HeroContent
            phase={phase}
            armed={armed}
            wordmarkA={copy.wordmarkA}
            wordmarkB={copy.wordmarkB}
            years={copy.years}
            tagline={copy.tagline}
            primary={copy.primary}
            secondary={copy.secondary}
            primaryHref={primaryHref}
            secondaryHref={secondaryHref}
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
