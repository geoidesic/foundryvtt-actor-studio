// Test script for equipment gold parsing
import { parseEquipmentGoldOptions } from './src/stores/equipmentGold.js';

// Mock Fighter class description with variable gold amounts
const mockFighterClass = {
  system: {
    description: {
      value: `<td><p><em>Choose A, B, or C:</em> (A) <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbarmChainMail0" data-id="phbarmChainMail0" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Equipment Item"><i class="fa-solid fa-suitcase" inert=""></i>Chain Mail</a>, <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbwepGreatsword" data-id="phbwepGreatsword" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Weapon Item"><i class="fa-solid fa-suitcase" inert=""></i>Greatsword</a>, <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbwepFlail00000" data-id="phbwepFlail00000" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Weapon Item"><i class="fa-solid fa-suitcase" inert=""></i>Flail</a>, 8 <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbwepJavelin000" data-id="phbwepJavelin000" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Weapon Item"><i class="fa-solid fa-suitcase" inert=""></i>Javelins</a>, <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbagDungeoneers" data-id="phbagDungeoneers" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Container Item"><i class="fa-solid fa-suitcase" inert=""></i>Dungeoneer's Pack</a>, and <span class="award-block dnd5e2" data-award-command=" 4GP">
    <span class="award-entry">
      4 <i class="currency gp" data-tooltip="" aria-label="Gold"></i>
    </span>
    <a class="award-link" data-action="awardRequest">
      <i class="fa-solid fa-trophy"></i> Award
    </a>
  </span>; (B) <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbarmStuddedLea" data-id="phbarmStuddedLea" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Equipment Item"><i class="fa-solid fa-suitcase" inert=""></i>Studded Leather Armor</a>, <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbwepScimitar00" data-id="phbwepScimitar00" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Weapon Item"><i class="fa-solid fa-suitcase" inert=""></i>Scimitar</a>, <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbwepShortsword" data-id="phbwepShortsword" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Weapon Item"><i class="fa-solid fa-suitcase" inert=""></i>Short­sword</a>, <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbwepLongbow000" data-id="phbwepLongbow000" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Weapon Item"><i class="fa-solid fa-suitcase" inert=""></i>Longbow</a>, 20 <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbamoArrows0000" data-id="phbamoArrows0000" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Consumable Item"><i class="fa-solid fa-suitcase" inert=""></i>Arrows</a>, <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbagQuiver00000" data-id="phbagQuiver00000" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Container Item"><i class="fa-solid fa-suitcase" inert=""></i>Quiver</a>, <a class="content-link" draggable="true" data-link="" data-uuid="Compendium.dnd-players-handbook.equipment.Item.phbagDungeoneers" data-id="phbagDungeoneers" data-type="Item" data-pack="dnd-players-handbook.equipment" data-tooltip="Item" data-tooltip-text="Container Item"><i class="fa-solid fa-suitcase" inert=""></i>Dungeoneer's Pack</a>, and <span class="award-block dnd5e2" data-award-command=" 11GP">
    <span class="award-entry">
      11 <i class="currency gp" data-tooltip="" aria-label="Gold"></i>
    </span>
    <a class="award-link" data-action="awardRequest">
      <i class="fa-solid fa-trophy"></i> Award
    </a>
  </span>; or (C) <span class="award-block dnd5e2" data-award-command=" 155GP">
    <span class="award-entry">
      155 <i class="currency gp" data-tooltip="" aria-label="Gold"></i>
    </span>
    <a class="award-link" data-action="awardRequest">
      <i class="fa-solid fa-trophy"></i> Award
    </a>
  </span></p></td>`
    }
  }
};

// Test the parsing function
console.log('Testing Fighter class equipment gold parsing...');
const result = parseEquipmentGoldOptions(mockFighterClass);
console.log('Result:', JSON.stringify(result, null, 2));

// Expected result should show:
// - hasVariableGold: true
// - goldOptions: [
//     { choice: 'A', goldAmount: 4, description: '...' },
//     { choice: 'B', goldAmount: 11, description: '...' },
//     { choice: 'C', goldAmount: 155, description: '...' }
//   ]

export { mockFighterClass, result };
