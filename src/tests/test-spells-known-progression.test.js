import { describe, it, expect } from 'vitest';
import spellsKnownData from '../stores/spellsKnown.json';

// Official spell progression tables sourced from PHB 2014 and PHB 2024.
// Legacy fixture format kept as "cantrips/spells"; assertions below normalize
// to spells-only because spellsKnown.json now stores spells-only values.

const OFFICIAL_2014 = {
  sorcerer:  [null,'4/2','4/3','4/4','5/5','5/6','5/7','5/8','5/9','5/10','6/11','6/12','6/12','6/13','6/13','6/14','6/14','6/15','6/15','6/15','6/15'],
  bard:      [null,'2/4','2/5','2/6','3/7','3/8','3/9','3/10','3/11','3/12','4/14','4/15','4/15','4/16','4/18','4/19','4/19','4/20','4/22','4/22','4/22'],
  warlock:   [null,'2/2','2/3','2/4','3/5','3/6','3/7','3/8','3/9','3/10','4/10','4/11','4/11','4/12','4/12','4/13','4/13','4/14','4/14','4/15','4/15'],
  wizard:    [null,'3/6','3/8','3/10','4/12','4/14','4/16','4/18','4/20','4/22','5/24','5/26','5/28','5/30','5/32','5/34','5/36','5/38','5/40','5/42','5/44'],
  cleric:    [null,'3/All','3/All','3/All','4/All','4/All','4/All','4/All','4/All','4/All','5/All','5/All','5/All','5/All','5/All','5/All','5/All','5/All','5/All','5/All','5/All'],
  druid:     [null,'2/All','2/All','2/All','3/All','3/All','3/All','3/All','3/All','3/All','4/All','4/All','4/All','4/All','4/All','4/All','4/All','4/All','4/All','4/All','4/All'],
  artificer: [null,'2/2','2/3','2/4','2/5','2/6','2/6','2/7','2/7','2/9','3/9','3/10','3/10','3/11','4/11','4/12','4/12','4/14','4/14','4/15','4/15'],
  ranger:    [null,'0/0','0/2','0/3','0/3','0/4','0/4','0/5','0/5','0/6','0/6','0/7','0/7','0/8','0/8','0/9','0/9','0/10','0/10','0/11','0/11'],
  paladin:   [null,'0/0','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All'],
};

// 2024 PHB changes vs 2014:
// - Sorcerer: same spells known as 2014 (the L2/L3 errors were the original bug)
// - Ranger: gains 1st spell at L1 (not L2), and higher counts throughout
// - Paladin: gains 1st spell at L1
// - Other classes: identical to 2014
const OFFICIAL_2024 = {
  sorcerer:  [null,'4/2','4/3','4/4','5/5','5/6','5/7','5/8','5/9','5/10','6/11','6/12','6/12','6/13','6/13','6/14','6/14','6/15','6/15','6/15','6/15'],
  bard:      [null,'2/4','2/5','2/6','3/7','3/8','3/9','3/10','3/11','3/12','4/14','4/15','4/15','4/16','4/18','4/19','4/19','4/20','4/22','4/22','4/22'],
  warlock:   [null,'2/2','2/3','2/4','3/5','3/6','3/7','3/8','3/9','3/10','4/10','4/11','4/11','4/12','4/12','4/13','4/13','4/14','4/14','4/15','4/15'],
  wizard:    [null,'3/6','3/8','3/10','4/12','4/14','4/16','4/18','4/20','4/22','5/24','5/26','5/28','5/30','5/32','5/34','5/36','5/38','5/40','5/42','5/44'],
  cleric:    [null,'3/All','3/All','3/All','4/All','4/All','4/All','4/All','4/All','4/All','5/All','5/All','5/All','5/All','5/All','5/All','5/All','5/All','5/All','5/All','5/All'],
  druid:     [null,'2/All','2/All','2/All','3/All','3/All','3/All','3/All','3/All','3/All','4/All','4/All','4/All','4/All','4/All','4/All','4/All','4/All','4/All','4/All','4/All'],
  artificer: [null,'2/2','2/3','2/4','2/5','2/6','2/6','2/7','2/7','2/9','3/9','3/10','3/10','3/11','4/11','4/12','4/12','4/14','4/14','4/15','4/15'],
  ranger:    [null,'0/2','0/3','0/4','0/5','0/6','0/6','0/7','0/7','0/8','0/8','0/9','0/9','0/11','0/11','0/12','0/12','0/13','0/13','0/14','0/14'],
  paladin:   [null,'0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All','0/All'],
};

// Normalize JSON stored values ("4 / 7") to the compact form used above ("4/7")
function normalize(raw) {
  if (typeof raw !== 'string') return null;
  return raw.replace(/\s+/g, '');
}

function normalizeExpectedSpellsOnly(rawExpected) {
  if (typeof rawExpected !== 'string') return null;
  const compact = normalize(rawExpected);
  return compact.includes('/') ? compact.split('/')[1] : compact;
}

function getLevelEntry(level) {
  return spellsKnownData.levels.find((e) => e.level === level);
}

describe('spellsKnown.json — 2014 progression', () => {
  for (const [className, expected] of Object.entries(OFFICIAL_2014)) {
    describe(className, () => {
      for (let lvl = 1; lvl <= 20; lvl++) {
        it(`level ${lvl} = ${expected[lvl]}`, () => {
          const entry = getLevelEntry(lvl);
          expect(entry, `no entry for level ${lvl}`).toBeDefined();
          const actual = normalize(entry[className]?.['2014'] ?? entry[className]);
          expect(actual).toBe(normalizeExpectedSpellsOnly(expected[lvl]));
        });
      }
    });
  }
});

describe('spellsKnown.json — 2024 progression', () => {
  for (const [className, expected] of Object.entries(OFFICIAL_2024)) {
    describe(className, () => {
      for (let lvl = 1; lvl <= 20; lvl++) {
        it(`level ${lvl} = ${expected[lvl]}`, () => {
          const entry = getLevelEntry(lvl);
          expect(entry, `no entry for level ${lvl}`).toBeDefined();
          const actual = normalize(entry[className]?.['2024']);
          expect(actual).toBe(normalizeExpectedSpellsOnly(expected[lvl]));
        });
      }
    });
  }
});

describe('spellsKnown.json — structure checks', () => {
  it('has entries for levels 1–20', () => {
    for (let lvl = 1; lvl <= 20; lvl++) {
      expect(getLevelEntry(lvl), `missing level ${lvl}`).toBeDefined();
    }
  });

  it('every level 1-20 entry has both 2014 and 2024 keys for all expected classes', () => {
    const classes = ['sorcerer', 'bard', 'warlock', 'wizard', 'cleric', 'druid', 'artificer', 'ranger', 'paladin'];
    for (let lvl = 1; lvl <= 20; lvl++) {
      const entry = getLevelEntry(lvl);
      for (const cls of classes) {
        expect(entry[cls], `level ${lvl} missing class "${cls}"`).toBeDefined();
        expect(entry[cls]['2014'], `level ${lvl} ${cls} missing 2014 key`).toBeDefined();
        expect(entry[cls]['2024'], `level ${lvl} ${cls} missing 2024 key`).toBeDefined();
      }
    }
  });
});
