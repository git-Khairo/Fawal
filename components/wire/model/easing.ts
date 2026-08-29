/**
 * Easing that communicates weight. Steel does not overshoot, so there is no
 * bounce or elastic curve here and there never should be.
 */
export const easeOutPower3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const easeInOutPower2 = (x: number) =>
  x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
export const easeInOutPower3 = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Symmetric triangle wave on 0..1, used for expanded metal and chain link. */
export const triangle = (x: number) => {
  const f = x - Math.floor(x);
  return f < 0.5 ? f * 4 - 1 : 3 - f * 4;
};
