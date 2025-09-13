import { describe, it, expect } from 'vitest';
import { hasDetailsCr, ensureRollDataCr } from '~/src/helpers/crRollData';

describe('crRollData helpers', () => {
  it('detects details.cr on actor', () => {
    const actor = { system: { details: { cr: 5 } } };
    expect(hasDetailsCr(actor, {})).toBe(true);
  });

  it('detects details.cr on item rollData', () => {
    const actor = {};
    const rd = { details: { cr: 2 } };
    expect(hasDetailsCr(actor, rd)).toBe(true);
  });

  it('ensures rollData gains details.cr when missing', () => {
    const actor = { system: { details: { cr: 3 } } };
    const rd = { foo: 1 };
    const out = ensureRollDataCr(actor, rd);
    expect(out).not.toBe(rd);
    expect(out.details.cr).toBe(3);
    expect(rd.details).toBeUndefined();
  });

  it('does not override existing details.cr', () => {
    const actor = { system: { details: { cr: 4 } } };
    const rd = { details: { cr: 1 } };
    const out = ensureRollDataCr(actor, rd);
    expect(out.details.cr).toBe(1);
  });
});
