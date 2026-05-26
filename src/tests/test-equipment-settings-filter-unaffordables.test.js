import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Equipment settings registration - filterOutUnaffordables', () => {
  it('registers filterOutUnaffordables with default true in settings source', () => {
    const filePath = path.join(process.cwd(), 'src/settings/equipment/registerEquipmentSettings.js');
    const content = fs.readFileSync(filePath, 'utf8');

    expect(content).toContain("game.settings.register(MODULE_ID, 'filterOutUnaffordables'");
    expect(content).toContain("default: true");
    expect(content).toContain("type: Boolean");
    expect(content).toContain("scope: 'world'");
    expect(content).toContain("config: false");
  });
});
