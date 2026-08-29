import type { Vec3, WireState } from "./types";
import { clamp01, easeInOutPower3, lerp } from "./easing";

/**
 * How far the transformation is spread along the wire, 0 to 1.
 *
 * At 0 every point changes at once, which reads as a crossfade. Above 0 the
 * change starts at one end and travels to the other, so the material appears to
 * be worked rather than swapped. This one constant is most of why the morph
 * feels engineered.
 */
const SPREAD = 0.45;

export function strandCount(from: WireState, to: WireState): number {
  return Math.max(from.strands, to.strands);
}

/**
 * Strands that do not exist in a given state collapse onto its first strand.
 *
 * That is what makes multiplication read correctly: the eight strands of a mesh
 * all start life sitting exactly on the single wire, so they split out of it
 * instead of fading in beside it.
 */
function strandFor(state: WireState, strand: number): number {
  return strand < state.strands ? strand : 0;
}

export function sampleMorph(
  from: WireState,
  to: WireState,
  progress: number,
  s: number,
  strand: number,
  t: number,
): Vec3 {
  if (progress <= 0) return from.sample(s, strandFor(from, strand), t);
  if (progress >= 1) return to.sample(s, strandFor(to, strand), t);

  // The travelling wavefront. Points near s=0 finish first.
  const local = easeInOutPower3(clamp01((progress - s * SPREAD) / (1 - SPREAD)));

  const a = from.sample(s, strandFor(from, strand), t);
  const b = to.sample(s, strandFor(to, strand), t);
  return {
    x: lerp(a.x, b.x, local),
    y: lerp(a.y, b.y, local),
    z: lerp(a.z, b.z, local),
  };
}

export function morphWeight(from: WireState, to: WireState, progress: number): number {
  return lerp(from.weight, to.weight, easeInOutPower3(clamp01(progress)));
}

/**
 * Samples a whole strand into a flat array of Vec3.
 *
 * Reuses the array it is given so a 60fps loop does not allocate a few hundred
 * objects every frame.
 */
export function sampleStrand(
  out: Vec3[],
  from: WireState,
  to: WireState,
  progress: number,
  strand: number,
  t: number,
  samples: number,
): Vec3[] {
  for (let i = 0; i < samples; i++) {
    const s = i / (samples - 1);
    const p = sampleMorph(from, to, progress, s, strand, t);
    const slot = out[i];
    if (slot) {
      slot.x = p.x;
      slot.y = p.y;
      slot.z = p.z;
    } else {
      out[i] = p;
    }
  }
  out.length = samples;
  return out;
}
