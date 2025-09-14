export type CRLike = number | string | null | undefined;

/** Parse a CR value (number or fraction string) to a number or NaN */
export function parseCR(cr: CRLike): number;

/** Ensure CR is number, or return fallback */
export function ensureNumberCR(cr: CRLike, fallback?: number): number;

declare const _default: {
  parseCR: (cr: CRLike) => number;
  ensureNumberCR: (cr: CRLike, fallback?: number) => number;
};

export default _default;
