export type Vec3 = { x: number; y: number; z: number };

/**
 * A wire state describes where any point of the wire sits, as a pure function.
 *
 * Products are not separate drawings that replace each other. They are different
 * parameterisations of the same material, which is what lets one become another
 * by interpolation rather than by a crossfade.
 *
 * `s` runs 0 to 1 along a strand. `strand` selects which strand. `t` is seconds,
 * for states that breathe.
 */
export type WireState = {
  id: string;
  /** How many strands this form is made of. One wire, two twisted, sixteen woven. */
  strands: number;
  /** Stroke weight multiplier. A rod is heavier than a binding wire. */
  weight: number;
  sample: (s: number, strand: number, t: number) => Vec3;
};

export type Camera = {
  /** Radians. Yaw carries most of the spatial reading. */
  rotY: number;
  rotX: number;
  /** Eye distance. Larger flattens the perspective. */
  dist: number;
  /** Object-space units mapped to half the smaller viewport axis. */
  zoom: number;
};
