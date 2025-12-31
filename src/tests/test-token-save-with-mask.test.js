import { describe, test, expect, beforeEach, vi } from 'vitest';
import { saveTokenConfiguration } from '~/src/helpers/tokenUtils';

describe('Token save with mask behavior (test-first)', () => {
  let mockActor;

  beforeEach(() => {
    mockActor = {
      id: 'actor-token-1',
      getFlag: vi.fn().mockResolvedValue([]),
      setFlag: vi.fn().mockResolvedValue(),
      update: vi.fn().mockResolvedValue()
    };

    // Mock FilePicker implementation to assert upload gets called and returns a masked path
    global.FilePicker = global.FilePicker || { implementation: { upload: vi.fn().mockResolvedValue({ files: ['worlds/test/actor/masked-portrait.png'] }) } };

    // No Tokenizer by default
    global.game = global.game || {};
    global.game.modules = new Map();
    global.game.modules.get = (name) => ({ active: false });
  });

  test('should upload masked image and update actor prototype token when portrait is a data URL and maskWithRing is true', async () => {
    const portraitDataUrl = 'data:image/png;base64,AAAA';

    await expect(saveTokenConfiguration({ actor: mockActor, portraitDataUrl, maskWithRing: true, subjectScale: 1.0 })).resolves.not.toThrow();

    // Verify FilePicker.upload was called (uploading masked data)
    expect(global.FilePicker.implementation.upload).toHaveBeenCalled();

    // Verify actor was updated with the saved masked path
    expect(mockActor.update).toHaveBeenCalled();
    const calls = mockActor.update.mock.calls;
    const latest = calls[calls.length - 1][0];
    expect(latest).toHaveProperty('prototypeToken.texture.src', 'worlds/test/actor/masked-portrait.png');
    expect(latest).toHaveProperty('prototypeToken.ring.enabled', true);
    expect(latest).toHaveProperty('prototypeToken.ring.subject.scale', 1.0);
  });
});
