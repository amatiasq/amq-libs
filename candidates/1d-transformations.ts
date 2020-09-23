// number between 0 and 1 (including both)
type Unit = number;
type Transformer = (t: Unit) => Unit;
type Creator<T extends any[] = [number]> = (...args: T) => Transformer;

const flip: Transformer = t => 1 - t;
const combine: Creator<[Transformer, Transformer]> = (a, b) => t => a(t) * b(t);

const mix: Creator<[Transformer, Transformer, number]> = (a, b, weight) =>
  // return (t: Unit) => a(t) + weight * (b(t) - a(t));
  t => flip(weight) * a(t) + weight * b(t);

export const crossfade: Creator<[Transformer, Transformer]> = (a, b) => t =>
  a(t) + t * (b(t) - a(t));

export const scale: Creator<[Transformer]> = a => t => t * a(t);
export const reverseScale: Creator<[Transformer]> = a => t => flip(t) * a(t);
export const arch2 = scale(flip);

export const smoothStart: Creator = e => t => t ** e;
export const smoothStop: Creator = e => t => flip(flip(t) ** e);

export const smoothStep3: Creator = e =>
  crossfade(smoothStart(e), smoothStop(e));

export const smoothStartArch3 = scale(arch2); // t => (t ** 2) * (1 - x)
export const smoothStopArch3 = reverseScale(arch2); // t => t * ((1 - x) ** 2)
export const smoothStepArch4 = reverseScale(scale(arch2));
export const bellCurve: Creator = e => combine(smoothStart(e), smoothStop(e));

export const smoothStart2_2 = mix(smoothStart(2), smoothStart(3), 0.2);
export const smoothStart2_6 = mix(smoothStart(2), smoothStart(3), 0.6);
