// Utility helpers to ensure CR (challenge rating) is treated as a number across the app.
// CR in Foundry/D&D5e can be a number or a fraction string like "1/2". This module
// provides stable parsing and a small runtime guard to coerce values to numbers.

/**
 * Parse a CR value which may be a number, numeric-string, or fraction string like "1/2".
 * Returns a Number or NaN if it cannot be parsed.
 * @param {number|string|undefined|null} cr
 * @returns {number}
 */
export function parseCR(cr) {
  if (cr === undefined || cr === null) return NaN;
  if (typeof cr === 'number') return Number.isFinite(cr) ? cr : NaN;
  if (typeof cr === 'string') {
    const s = cr.trim();
    if (s.includes('/')) {
      const parts = s.split('/').map((p) => p.trim());
      if (parts.length === 2) {
        const num = Number(parts[0]);
        const den = Number(parts[1]);
        if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) return num / den;
      }
      return NaN;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }
  // Fallback for objects that may wrap value (e.g., some Foundry data shapes)
  try {
    const maybe = Number(cr);
    return Number.isFinite(maybe) ? maybe : NaN;
  } catch (err) {
    return NaN;
  }
}

/**
 * Ensure the returned CR is a finite number; if not, return fallback (default 0).
 * @param {any} cr
 * @param {number} [fallback=0]
 * @returns {number}
 */
export function ensureNumberCR(cr, fallback = 0) {
  const n = parseCR(cr);
  return Number.isFinite(n) ? n : fallback;
}

export default { parseCR, ensureNumberCR };
