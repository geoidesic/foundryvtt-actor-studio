import { describe, it, expect } from 'vitest';
import { updateDamageText } from '~/src/helpers/DamageTextUpdater';

describe('DamageTextUpdater', () => {
  it('updates Hit: N (XdY+Z) pattern', () => {
    const html = 'Hit: 7 (2d4+0) piercing damage';
    const updated = updateDamageText(html, { number: 4, denomination: 4, bonus: 0 });
    expect(updated).toContain('Hit:');
    expect(updated).toContain('(4d4)');
    // average 4d4 = 10
    expect(updated).toContain('Hit: 10');
  });

  it('updates XdY damage pattern without Hit prefix', () => {
    const html = 'The blast deals 2d6 fire damage.';
    const updated = updateDamageText(html, { number: 6, denomination: 6, bonus: 0 });
    expect(updated).toContain('6d6 fire damage');
  });

  it('is idempotent when called again with same dice', () => {
    const html = 'Hit: 10 (4d4) piercing damage';
    const once = updateDamageText(html, { number: 4, denomination: 4, bonus: 0 });
    const twice = updateDamageText(once, { number: 4, denomination: 4, bonus: 0 });
    expect(twice).toBe(once);
  });
});
