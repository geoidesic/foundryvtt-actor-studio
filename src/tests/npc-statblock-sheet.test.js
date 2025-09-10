import { describe, it, expect, vi, beforeAll } from 'vitest';

// Skipped: relies on browser-only TyphonJS runtime; keep disabled in Node test env
describe.skip('GAS NPC Statblock Sheet registration', () => {
  beforeAll(async () => {
    // Minimal Foundry globals
    globalThis.game = { system: { id: 'dnd5e' } };
    globalThis.dnd5e = { applications: { actor: { ActorSheet5eNPC: class {} } } };
    globalThis.foundry = { utils: { mergeObject: (a, b) => ({ ...(a || {}), ...(b || {}) }) } };

    // Mock Actors.registerSheet
    globalThis.Actors = { registerSheet: vi.fn() };

    // Make Hooks.once immediately invoke the callback for 'init'
    globalThis.Hooks = {
      once: vi.fn((hook, cb) => { if (hook === 'init') cb(); }),
      on: vi.fn(),
      call: vi.fn(),
    };

    // Import module entry which registers the sheet on init
    await import('~/src/index.js');
  });

  it('registers a sheet for dnd5e NPC actors', () => {
    expect(Actors.registerSheet).toHaveBeenCalled();
    const args = Actors.registerSheet.mock.calls.find(Boolean);
    expect(args?.[0]).toBe('dnd5e');
    // options
    const opts = args?.[2] || {};
    expect(opts.types).toEqual(expect.arrayContaining(['npc']));
  });
});
