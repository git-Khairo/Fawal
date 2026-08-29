import type { Vec3, WireState } from "./types";
import { triangle } from "./easing";

/**
 * The six forms, in the order the catalogue lists them.
 *
 * Every one of these is the same material. Nothing here is a picture of a
 * product; each is a description of what the wire is doing, which is why one can
 * turn into the next.
 *
 * Object space is roughly -1..1 on each axis, mapped to the viewport by the
 * camera. Keep shapes inside that so no form clips when another is wider.
 */

const AXIS = 0.94;

/** 01 Metal wire. The raw material, and the state every other form comes from. */
export const metalWire: WireState = {
  id: "metal-wire",
  strands: 1,
  weight: 1,
  sample: (s, _strand, t) => ({
    x: (s - 0.5) * 2 * AXIS,
    y: Math.sin(s * Math.PI * 1.15 + t * 0.22) * 0.17,
    z: Math.sin(s * Math.PI * 0.75 + t * 0.17) * 0.34,
  }),
};

/**
 * 02 Barbed wire. Two strands twisted around a common axis, with barbs that
 * grow out of the line rather than appearing beside it.
 *
 * Strands 0 and 1 are the twist. Strands 2 upward are barbs: each is a short
 * segment crossing the axis at a fixed station, so when this form is entered
 * from a single wire they emerge out of it.
 */
const BARB_COUNT = 11;
export const barbedWire: WireState = {
  id: "barbed-wire",
  strands: 2 + BARB_COUNT,
  weight: 1,
  sample: (s, strand, t) => {
    if (strand < 2) {
      const turns = 9;
      const phase = strand * Math.PI + s * Math.PI * 2 * turns + t * 0.35;
      return {
        x: (s - 0.5) * 2 * AXIS,
        y: Math.sin(phase) * 0.075,
        z: Math.cos(phase) * 0.075,
      };
    }
    const k = strand - 2;
    const station = (k + 0.5) / BARB_COUNT;
    const twist = station * Math.PI * 2 * 9 + t * 0.35;
    // Barbs sit on the twist and point away from it, alternating side.
    const roll = twist + (k % 2 === 0 ? 0 : Math.PI) + Math.PI / 2;
    const reach = (s - 0.5) * 2 * 0.15;
    return {
      x: (station - 0.5) * 2 * AXIS + reach * 0.42,
      y: Math.sin(twist) * 0.075 + Math.sin(roll) * reach,
      z: Math.cos(twist) * 0.075 + Math.cos(roll) * reach,
    };
  },
};

/** 03 Fencing mesh. Woven strands, with the over and under of a real weave. */
const MESH_H = 8;
const MESH_V = 9;
export const fencingMesh: WireState = {
  id: "fencing-mesh",
  strands: MESH_H + MESH_V,
  weight: 0.85,
  sample: (s, strand, t) => {
    const breathe = Math.sin(t * 0.3) * 0.012;
    if (strand < MESH_H) {
      const row = strand / (MESH_H - 1) - 0.5;
      return {
        x: (s - 0.5) * 2 * AXIS,
        y: row * 1.24,
        // The crimp that makes it a weave rather than a printed grid.
        z: Math.sin(s * Math.PI * MESH_V) * (0.042 + breathe),
      };
    }
    const col = (strand - MESH_H) / (MESH_V - 1) - 0.5;
    return {
      x: col * 2 * AXIS,
      y: (s - 0.5) * 1.24,
      z: -Math.sin(s * Math.PI * MESH_H) * (0.042 + breathe),
    };
  },
};

/** 04 Steel rods. Straight, heavy, stacked into a bundle. */
const ROD_COUNT = 7;
export const steelRods: WireState = {
  id: "steel-bar",
  strands: ROD_COUNT,
  weight: 2.5,
  sample: (s, strand) => {
    const k = strand / (ROD_COUNT - 1) - 0.5;
    return {
      x: (s - 0.5) * 2 * AXIS,
      y: k * 0.5,
      z: k * 0.62,
    };
  },
};

/**
 * 05 Expanded metal. Rows of slit sheet pulled open, so the diamond apertures
 * are formed by the geometry rather than drawn as a texture.
 */
const EXPAND_ROWS = 11;
export const expandedMetal: WireState = {
  id: "expanded-metal",
  strands: EXPAND_ROWS,
  weight: 1.15,
  sample: (s, strand) => {
    const row = strand / (EXPAND_ROWS - 1) - 0.5;
    const phase = strand % 2 === 0 ? 0 : 0.5;
    return {
      x: (s - 0.5) * 2 * AXIS,
      y: row * 1.2 + triangle(s * 7 + phase) * 0.085,
      z: triangle(s * 7 + phase) * 0.05,
    };
  },
};

/** 06 Binding wire. One strand, coiled into the loops of a notebook spine. */
export const bindingWire: WireState = {
  id: "binding-wire",
  strands: 1,
  weight: 1.1,
  sample: (s, _strand, t) => {
    const turns = 15;
    const a = s * Math.PI * 2 * turns + t * 0.4;
    return {
      x: (s - 0.5) * 2 * AXIS,
      y: Math.sin(a) * 0.3,
      z: Math.cos(a) * 0.3,
    };
  },
};

/** Keyed by the catalogue category slug, so the two never drift apart. */
export const WIRE_STATES: Record<string, WireState> = {
  "metal-wire": metalWire,
  "barbed-wire": barbedWire,
  "fencing-mesh": fencingMesh,
  "steel-bar": steelRods,
  "expanded-metal": expandedMetal,
  "binding-wire": bindingWire,
};

export const STATE_ORDER = [
  "metal-wire",
  "barbed-wire",
  "fencing-mesh",
  "steel-bar",
  "expanded-metal",
  "binding-wire",
] as const;

export type StateId = (typeof STATE_ORDER)[number];

/** A single straight length, used by the connector wire and the closing arrow. */
export function straightRun(bend = 0): WireState {
  return {
    id: `straight-${bend}`,
    strands: 1,
    weight: 1,
    sample: (s): Vec3 => ({
      x: (s - 0.5) * 2 * AXIS,
      y: Math.sin(s * Math.PI) * bend,
      z: 0,
    }),
  };
}
