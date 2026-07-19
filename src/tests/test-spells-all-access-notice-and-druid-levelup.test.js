import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('All-spells notice + druid level-up regressions', () => {
  it('should use effectiveSelectedSpellCount in the all-spells notice message', () => {
    const filePath = resolve(process.cwd(), 'src/components/organisms/dnd5e/Tabs/Spells.svelte');
    const source = readFileSync(filePath, 'utf8');

    expect(source).toContain('em {effectiveSelectedSpellCount} spells are auto-selected.');
    expect(source).not.toContain('em {displaySpellLimit} spells are auto-selected.');
  });

  describe('druid level-up spell progression', () => {
    let spellModule;
    let get;

    beforeEach(async () => {
      vi.resetModules();

      global.ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
      global.window = globalThis;
      window.GAS = { log: { d: vi.fn(), p: vi.fn(), e: vi.fn(), w: vi.fn() } };
      global.game = {
        settings: { get: vi.fn(() => false) },
        user: { isGM: true },
        modules: { get: vi.fn(() => ({ active: false })) }
      };

      vi.doMock('svelte/store', async () => {
        const actual = await vi.importActual('svelte/store');
        return {
          ...actual,
          get: vi.fn((store) => {
            let value;
            const unsubscribe = store.subscribe((v) => {
              value = v;
            });
            unsubscribe();
            return value;
          })
        };
      });

      vi.doMock('~/src/stores/index', async () => {
        const { writable } = await vi.importActual('svelte/store');
        return {
          readOnlyTabs: writable([]),
          characterClass: writable({ name: 'druid', system: { identifier: 'druid' } }),
          characterSubClass: writable(null),
          isLevelUp: writable(true),
          newLevelValueForExistingClass: writable(3),
          levelUpClassObject: writable({
            name: 'Druid',
            system: {
              identifier: 'druid',
              spellcasting: { progression: 'full' }
            }
          }),
          classUuidForLevelUp: writable(null)
        };
      });

      spellModule = await import('~/src/stores/spellSelection.js');
      ({ get } = await import('svelte/store'));

      spellModule.currentCharacter.set({
        name: 'Level 3 Druid Test',
        getFlag: vi.fn(() => null),
        classes: {
          druid: {
            system: {
              identifier: 'druid',
              spellcasting: { progression: 'full' }
            }
          }
        },
        items: []
      });

      spellModule.selectedSpells.set(new Map());
    });

    it('should require spell updates for druid level-up from 2 to 3', () => {
      const progress = get(spellModule.spellProgress);

      expect(progress.hasAllSpells).toBe(true);
      expect(progress.noUpdatesNeeded).toBe(false);
    });
  });
});