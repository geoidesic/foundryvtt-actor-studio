/**
 * Utilities to update damage expressions in item descriptions.
 * Patterns handled (first match per call):
 *  - "Hit: N (XdY[+Z]) ..."
 *  - "XdY[+Z] <type> damage"
 */

export function computeAverageDice({ number, denomination, bonus = 0 }) {
  const n = Number(number) || 0;
  const d = Number(denomination) || 0;
  const b = Number(bonus) || 0;
  if (n <= 0 || d <= 0) return 0;
  return Math.round(n * ((d + 1) / 2) + b);
}

export function formatDice({ number, denomination, bonus = 0 }) {
  const n = Number(number) || 0;
  const d = Number(denomination) || 0;
  const b = Number(bonus) || 0;
  const bonusStr = b === 0 ? '' : (b > 0 ? `+${b}` : `${b}`);
  return `${n}d${d}${bonusStr}`;
}

/**
 * Update a description string to reflect new dice. Idempotent for same inputs.
 * - If pattern "Hit: N (XdY[+Z])" exists, updates both N and the dice.
 * - Else, updates first occurrence of "XdY[+Z] <type> damage".
 * @param {string} html
 * @param {{ number:number, denomination:number, bonus?:number }} newDice
 * @param {{ updateHitTotal?: boolean }} [options]
 */
export function updateDamageText(html, newDice, { updateHitTotal = true } = {}) {
  if (typeof html !== 'string' || !newDice) return html;

  const diceStr = formatDice(newDice);
  const avg = computeAverageDice(newDice);

  // Pattern 1: Hit: N (XdY[+Z]) ...
  const hitRe = /(Hit:\s*)(\d+)\s*\((\d+)d(\d+)([+-]\d+)?\)/i;
  if (hitRe.test(html)) {
    return html.replace(hitRe, (m, prefix, nStr, xStr, dStr, bStr = '') => {
      const hitTotal = updateHitTotal ? String(avg) : nStr;
      return `${prefix}${hitTotal} (${diceStr})`;
    });
  }

  // Pattern 2: XdY[+Z] <type> damage
  // Capture keeps the type tokens intact. Optional bonus.
  const dmgRe = /(\b)(\d+)d(\d+)([+-]\d+)?(\s+[a-z]+)?\s+damage\b/i;
  if (dmgRe.test(html)) {
    return html.replace(dmgRe, (m, boundary) => {
      // Replace only the dice part, keep the rest of the string as-is
      return m.replace(/\b\d+d\d+(?:[+-]\d+)?/, diceStr);
    });
  }

  return html;
}

export default {
  computeAverageDice,
  formatDice,
  updateDamageText
};
