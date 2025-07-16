import { describe, it, expect } from 'vitest';

describe('Regex Pattern Debug', () => {
  it('should debug the choice pattern regex for Artisan background', () => {
    const description = `<p><strong>Equipment:</strong> Choose A or B: (A) <em>Artisan's Tools</em> (same as above), 2 <em>Pouches</em>, <em>Traveler's Clothes</em>, 32 GP; or (B) 50 GP</p>`;
    
    console.log('Original description:', description);
    
    // Current regex pattern
    const choicePattern = /\(([A-Z])\)[^(]*?(\d+)\s*(?:GP|gp)/gi;
    const choiceMatches = [...description.matchAll(choicePattern)];
    
    console.log('Choice matches found:', choiceMatches.length);
    choiceMatches.forEach((match, i) => {
      console.log(`Match ${i}:`, {
        fullMatch: match[0],
        choice: match[1],
        goldAmount: match[2],
        index: match.index
      });
    });
    
    // The issue might be that choice A has a lot of text between (A) and 32 GP
    // Let's try a more flexible pattern
    const betterPattern = /\(([A-Z])\)[^()]*?(\d+)\s*(?:GP|gp)/gi;
    const betterMatches = [...description.matchAll(betterPattern)];
    
    console.log('\nBetter pattern matches:', betterMatches.length);
    betterMatches.forEach((match, i) => {
      console.log(`Better match ${i}:`, {
        fullMatch: match[0],
        choice: match[1],
        goldAmount: match[2],
        index: match.index
      });
    });

    // Even more flexible pattern that allows more text between
    const flexiblePattern = /\(([A-Z])\).*?(\d+)\s*(?:GP|gp)/gi;
    const flexibleMatches = [...description.matchAll(flexiblePattern)];
    
    console.log('\nFlexible pattern matches:', flexibleMatches.length);
    flexibleMatches.forEach((match, i) => {
      console.log(`Flexible match ${i}:`, {
        fullMatch: match[0],
        choice: match[1],
        goldAmount: match[2],
        index: match.index
      });
    });
  });
});
