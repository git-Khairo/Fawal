"use client";

import { useCallback, useRef } from "react";
import { WireCanvas, type SceneFrame } from "../render/wire-canvas";
import { readMetalPalette, type MetalPalette } from "../render/metal-material";
import { HeroScene } from "./hero-scene";
import { heroParamsAt, settledParams, SETTLED_AT } from "./hero-timeline";

/**
 * Renders the opening sequence.
 *
 * The clock lives here rather than in React state, because the timeline updates
 * every frame and driving that through a re-render would be absurd. `onSettle`
 * is the only thing that crosses back into React, and it fires once.
 */
export function MetalScene({
  skipRef,
  onSettle,
  className,
}: {
  /** Set to true by the page when the visitor scrolls, to fast forward. */
  skipRef: React.RefObject<boolean>;
  onSettle: () => void;
  className?: string;
}) {
  const scene = useRef<HeroScene | null>(null);
  const palette = useRef<MetalPalette | null>(null);
  const clock = useRef(0);
  const last = useRef(0);
  const settled = useRef(false);

  const draw = useCallback(
    ({ ctx, width, height, time, px, py, still }: SceneFrame) => {
      if (!scene.current) scene.current = new HeroScene();
      if (!palette.current) palette.current = readMetalPalette();

      if (still) {
        // Reduced motion gets the finished composition, not a shortened film.
        scene.current.draw(ctx, width, height, settledParams(), 0, 0, 0, palette.current);
        if (!settled.current) {
          settled.current = true;
          onSettle();
        }
        return;
      }

      const dt = Math.min(0.05, Math.max(0, time - last.current));
      last.current = time;
      // Scrolling does not cut the sequence off, it runs it faster, so the
      // visitor still sees the material become a structure.
      clock.current += dt * (skipRef.current && clock.current < SETTLED_AT ? 3.4 : 1);

      const p = heroParamsAt(clock.current);
      scene.current.draw(ctx, width, height, p, clock.current, px, py, palette.current);

      if (!settled.current && clock.current >= SETTLED_AT) {
        settled.current = true;
        onSettle();
      }
    },
    [onSettle, skipRef],
  );

  return <WireCanvas draw={draw} className={className} maxDpr={1.75} />;
}
