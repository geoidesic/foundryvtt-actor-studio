// Utilities to detect and ensure details.cr availability in roll data

/**
 * Check if an actor/item roll data likely exposes details.cr
 * Accepts plain objects shaped like Actor.toObject() and Item rollData outputs.
 */
export function hasDetailsCr(actor, itemRollData) {
  const crOnActor = !!actor?.system?.details?.cr;
  const crInItemRD = !!(itemRollData && getNested(itemRollData, ['details', 'cr']));
  return crOnActor || crInItemRD;
}

/**
 * Merge actor.system.details.cr into provided rollData if missing.
 * Returns a shallow-cloned rollData.
 */
export function ensureRollDataCr(actor, rollData = {}) {
  const out = { ...rollData };
  const hasCr = !!getNested(out, ['details', 'cr']);
  if (!hasCr) {
    const cr = actor?.system?.details?.cr;
    if (cr != null) {
      out.details = { ...(out.details || {}), cr };
    }
  }
  return out;
}

function getNested(obj, path) {
  return path.reduce((acc, key) => (acc && acc[key] != null ? acc[key] : undefined), obj);
}
