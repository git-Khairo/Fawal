import { clamp01, easeInOutPower3, easeOutExpo, easeOutPower3, lerp } from "../model/easing";

/**
 * The opening sequence, expressed as a pure function of time.
 *
 * Keeping the whole timeline as `seconds -> parameters` means the sequence can
 * be scrubbed, skipped, fast forwarded or rendered as a single still without any
 * of that logic living in the renderer. Reduced motion simply asks for the
 * settled frame.
 */
export type HeroParams = {
  /** Horizontal strands present. Fractional, so the last one is mid-arrival. */
  wires: number;
  /** Vertical strands present. */
  verticals: number;
  /** How far along its length each strand has been drawn, 0 to 1. */
  reveal: number;
  /** Tension applied across the run. */
  bend: number;
  /** How far the mesh tiles outward once the camera pulls back. */
  panels: number;
  /** Posts appear with the structure, not before it. */
  posts: number;
  camDist: number;
  camZoom: number;
  camRotY: number;
  camRotX: number;
  /** Atmosphere. Almost invisible, there to give the dark room depth. */
  haze: number;
  /** Drives the content reveal: 0 nothing, 1 wordmark, 2 line, 3 actions. */
  contentPhase: number;
};

/** Where the sequence comes to rest. Also the reduced-motion frame. */
export const SETTLED_AT = 5.4;

const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

export function heroParamsAt(time: number): HeroParams {
  const t = Math.max(0, time);

  // 0.7 to 1.6  the wire is drawn out of the dark
  const draw = easeOutExpo(seg(t, 0.65, 1.75));
  // 1.4 to 2.1  tension is applied
  const bend = easeInOutPower3(seg(t, 1.35, 2.15));
  // 2.0 to 2.8  parallel strands are drawn alongside
  const multiply = easeInOutPower3(seg(t, 1.95, 2.85));
  // 2.5 to 3.4  perpendicular strands cross them
  const weave = easeInOutPower3(seg(t, 2.5, 3.45));
  // 3.2 to 4.5  the camera pulls back and the structure appears
  const pull = easeInOutPower3(seg(t, 3.15, 4.55));

  return {
    reveal: draw,
    bend: lerp(0, 1, bend) * (1 - pull * 0.55),
    wires: lerp(1, 9, multiply),
    verticals: lerp(0, 11, weave),
    panels: easeOutPower3(seg(t, 3.6, 5.0)) * 2,
    posts: easeOutPower3(seg(t, 3.9, 5.1)),

    // Starts close enough that the material is abstract, ends far enough that
    // it is plainly a structure.
    camZoom: lerp(2.25, 0.92, pull),
    camDist: lerp(2.2, 3.6, pull),
    camRotY: lerp(-0.42, 0.28, easeInOutPower3(seg(t, 0.6, 4.8))),
    camRotX: lerp(0.16, -0.07, pull),

    haze: lerp(0.5, 0.16, seg(t, 0.3, 3.0)),

    contentPhase:
      seg(t, 4.35, 4.9) + seg(t, 4.75, 5.25) + seg(t, 5.05, 5.5),
  };
}

export function settledParams(): HeroParams {
  return heroParamsAt(SETTLED_AT);
}
