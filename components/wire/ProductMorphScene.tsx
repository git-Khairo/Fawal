"use client";

import { useCallback, useEffect, useRef } from "react";
import { WireCanvas, type SceneFrame } from "./render/wire-canvas";
import { drawStrand, readMetalPalette, type MetalPalette } from "./render/metal-material";
import { makeProjected, project, type Projected } from "./model/project";
import { morphWeight, sampleMorph, sampleStrand, strandCount } from "./model/morph";
import { WIRE_STATES, type StateId } from "./model/wire-state";
import type { Camera, Vec3, WireState } from "./model/types";

/** Inside the range the brief asks for. Long enough to read as work being done. */
const MORPH_MS = 1150;

/**
 * The stage where one material becomes six products.
 *
 * Nothing here is swapped. The wire currently on screen is the wire that will be
 * the next product, so every transition is an interpolation of the same sample
 * set. Interrupting a transition freezes whatever shape is on screen and morphs
 * out of that, rather than snapping to the end of the one in progress.
 */
export function ProductMorphScene({
  activeId,
  samples = 128,
  className,
  ariaLabel,
}: {
  activeId: StateId;
  samples?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const from = useRef<WireState>(WIRE_STATES[activeId]);
  const to = useRef<WireState>(WIRE_STATES[activeId]);
  const progress = useRef(1);
  const startedAt = useRef(0);
  const palette = useRef<MetalPalette | null>(null);

  // Buffers are allocated once. A 60fps loop must not create objects per frame.
  const buffers = useRef<Vec3[][]>([]);
  const projected = useRef<Projected[][]>([]);

  useEffect(() => {
    const next = WIRE_STATES[activeId];
    if (!next || next === to.current) return;

    if (progress.current < 1) {
      // Freeze the shape currently on screen and depart from it, so a fast
      // click does not yank the geometry back to a form nobody saw.
      const a = from.current;
      const b = to.current;
      const p = progress.current;
      const frozenTime = (performance.now() - startedAt.current) / 1000;
      from.current = {
        id: "frozen",
        strands: strandCount(a, b),
        weight: morphWeight(a, b, p),
        sample: (s, strand) => sampleMorph(a, b, p, s, strand, frozenTime),
      };
    } else {
      from.current = to.current;
    }

    to.current = next;
    progress.current = 0;
    startedAt.current = performance.now();
  }, [activeId]);

  // A ref, not a memo: this is mutated every frame, which is what refs are for.
  const camera = useRef<Camera>({ rotY: 0, rotX: 0, dist: 3.1, zoom: 1.02 });

  const draw = useCallback(
    ({ ctx, width, height, time, px, py, still }: SceneFrame) => {
      if (!palette.current) palette.current = readMetalPalette();
      const pal = palette.current;

      if (still) {
        progress.current = 1;
      } else if (progress.current < 1) {
        progress.current = Math.min(1, (performance.now() - startedAt.current) / MORPH_MS);
      }

      const a = from.current;
      const b = to.current;
      const p = progress.current;
      const count = strandCount(a, b);
      const t = still ? 0 : time;

      // Slow yaw so the form reads as an object in space, plus a touch of
      // pointer. Roughly two degrees: felt rather than noticed.
      const cam = camera.current;
      cam.rotY = (still ? 0.35 : 0.35 + Math.sin(t * 0.11) * 0.22) + px * 0.045;
      cam.rotX = -0.1 + (still ? 0 : Math.sin(t * 0.08) * 0.04) + py * 0.03;

      // The key light drifts a little, which is what makes the surface feel
      // touchable rather than printed.
      const lightAngle = -2.25 + (still ? 0 : Math.sin(t * 0.13) * 0.28) + px * 0.12;
      const light = { x: Math.cos(lightAngle), y: Math.sin(lightAngle) };

      // Heavy enough to read as stock rather than as a hairline drawing.
      const baseWidth = Math.min(width, height) * 0.0105 * morphWeight(a, b, p);

      // Sample and project every strand, then order back to front so the
      // painter's result reads as depth.
      const order: { strand: number; depth: number }[] = [];
      for (let strand = 0; strand < count; strand++) {
        if (!buffers.current[strand]) buffers.current[strand] = [];
        if (!projected.current[strand]) projected.current[strand] = [];

        const pts = sampleStrand(buffers.current[strand], a, b, p, strand, t, samples);
        const proj = projected.current[strand];

        let depthSum = 0;
        for (let i = 0; i < samples; i++) {
          if (!proj[i]) proj[i] = makeProjected();
          project(pts[i], cam, width, height, proj[i]);
          depthSum += proj[i].depth;
        }
        proj.length = samples;
        order.push({ strand, depth: depthSum / samples });
      }

      order.sort((l, r) => r.depth - l.depth);
      for (const { strand } of order) {
        drawStrand(ctx, projected.current[strand], baseWidth, light, pal);
      }
    },
    [samples],
  );

  return <WireCanvas draw={draw} className={className} ariaLabel={ariaLabel} />;
}
