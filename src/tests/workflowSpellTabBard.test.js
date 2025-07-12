// --- Vitest Mocks: MUST be at the very top before any imports ---
vi.mock('~/src/helpers/constants', () => ({ MODULE_ID: 'test-module-id' }));
vi.mock('~/src/helpers/Utility', () => ({ getSubclassLevel: vi.fn() }));
vi.mock('~/src/stores/advancements', () => ({ advancementQueueStore: vi.fn(() => ({ name: '' })) }));
vi.mock('~/src/stores/goldChoices', () => ({ clearGoldChoices: vi.fn() }));
vi.mock('~/src/stores/equipmentSelections', () => ({ clearEquipmentSelections: vi.fn() }));
vi.mock('~/src/stores/startingEquipment', () => ({ clearStartingEquipment: vi.fn() }));
vi.mock('~/src/stores/spellSelection', () => ({}));

// Inlining factory functions directly into vi.mock to prevent ReferenceError
vi.mock('~/src/stores/storeDefinitions', () => {
	const { writable } = require('svelte/store');
	return {
		race: writable(false),
		subRace: writable(false),
		background: writable(false),
		characterClass: writable(false),
		characterSubClass: writable(false),
		abilities: writable(false),
		spells: writable(false),
		pointBuyScoreTotal: writable(12),
		pointBuyLimit: writable(27),
		abilityRolls: writable(false),
		isStandardArrayValues: writable(false),
		level: writable(1),
		activeTab: writable(''),
		isActorCreated: writable(false),
		tabs: writable([]),
		levelUpTabs: writable([]),
		actorInGame: writable(null),
		abilityGenerationMethod: writable(null),
		subClassesForClass: writable([]),
		goldRoll: writable(0),
		readOnlyTabs: writable([]),
		isLevelUp: writable(false),
		classUuidForLevelUp: writable(null),
		subClassUuidForLevelUp: writable(null),
		newLevelValueForExistingClass: writable(false),
		selectedMultiClassUUID: writable(false),
		levelUpClassObject: writable(null),
		levelUpSubClassObject: writable(null),
		activeRowClassKey: writable(null),
		levelUpCombinedHtml: writable(''),
		levelUpRichHTML: writable(''),
		levelUpRichSubClassHTML: writable(''),
	};
});
vi.mock('~/src/stores/storeDefinitions.js', () => {
	const { writable } = require('svelte/store');
	return {
		race: writable(false),
		subRace: writable(false),
		background: writable(false),
		characterClass: writable(false),
		characterSubClass: writable(false),
		abilities: writable(false),
		spells: writable(false),
		pointBuyScoreTotal: writable(12),
		pointBuyLimit: writable(27),
		abilityRolls: writable(false),
		isStandardArrayValues: writable(false),
		level: writable(1),
		activeTab: writable(''),
		isActorCreated: writable(false),
		tabs: writable([]),
		levelUpTabs: writable([]),
		actorInGame: writable(null),
		abilityGenerationMethod: writable(null),
		subClassesForClass: writable([]),
		goldRoll: writable(0),
		readOnlyTabs: writable([]),
		isLevelUp: writable(false),
		classUuidForLevelUp: writable(null),
		subClassUuidForLevelUp: writable(null),
		newLevelValueForExistingClass: writable(false),
		selectedMultiClassUUID: writable(false),
		levelUpClassObject: writable(null),
		levelUpSubClassObject: writable(null),
		activeRowClassKey: writable(null),
		levelUpCombinedHtml: writable(''),
		levelUpRichHTML: writable(''),
		levelUpRichSubClassHTML: writable(''),
	};
});
vi.mock('../stores/storeDefinitions', () => {
	const { writable } = require('svelte/store');
	return {
		race: writable(false),
		subRace: writable(false),
		background: writable(false),
		characterClass: writable(false),
		characterSubClass: writable(false),
		abilities: writable(false),
		spells: writable(false),
		pointBuyScoreTotal: writable(12),
		pointBuyLimit: writable(27),
		abilityRolls: writable(false),
		isStandardArrayValues: writable(false),
		level: writable(1),
		activeTab: writable(''),
		isActorCreated: writable(false),
		tabs: writable([]),
		levelUpTabs: writable([]),
		actorInGame: writable(null),
		abilityGenerationMethod: writable(null),
		subClassesForClass: writable([]),
		goldRoll: writable(0),
		readOnlyTabs: writable([]),
		isLevelUp: writable(false),
		classUuidForLevelUp: writable(null),
		subClassUuidForLevelUp: writable(null),
		newLevelValueForExistingClass: writable(false),
		selectedMultiClassUUID: writable(false),
		levelUpClassObject: writable(null),
		levelUpSubClassObject: writable(null),
		activeRowClassKey: writable(null),
		levelUpCombinedHtml: writable(''),
		levelUpRichHTML: writable(''),
		levelUpRichSubClassHTML: writable(''),
	};
});
vi.mock('../stores/storeDefinitions.js', () => {
	const { writable } = require('svelte/store');
	return {
		race: writable(false),
		subRace: writable(false),
		background: writable(false),
		characterClass: writable(false),
		characterSubClass: writable(false),
		abilities: writable(false),
		spells: writable(false),
		pointBuyScoreTotal: writable(12),
		pointBuyLimit: writable(27),
		abilityRolls: writable(false),
		isStandardArrayValues: writable(false),
		level: writable(1),
		activeTab: writable(''),
		isActorCreated: writable(false),
		tabs: writable([]),
		levelUpTabs: writable([]),
		actorInGame: writable(null),
		abilityGenerationMethod: writable(null),
		subClassesForClass: writable([]),
		goldRoll: writable(0),
		readOnlyTabs: writable([]),
		isLevelUp: writable(false),
		classUuidForLevelUp: writable(null),
		subClassUuidForLevelUp: writable(null),
		newLevelValueForExistingClass: writable(false),
		selectedMultiClassUUID: writable(false),
		levelUpClassObject: writable(null),
		levelUpSubClassObject: writable(null),
		activeRowClassKey: writable(null),
		levelUpCombinedHtml: writable(''),
		levelUpRichHTML: writable(''),
		levelUpRichSubClassHTML: writable(''),
	};
});
vi.mock('../../src/stores/storeDefinitions', () => {
	const { writable } = require('svelte/store');
	return {
		race: writable(false),
		subRace: writable(false),
		background: writable(false),
		characterClass: writable(false),
		characterSubClass: writable(false),
		abilities: writable(false),
		spells: writable(false),
		pointBuyScoreTotal: writable(12),
		pointBuyLimit: writable(27),
		abilityRolls: writable(false),
		isStandardArrayValues: writable(false),
		level: writable(1),
		activeTab: writable(''),
		isActorCreated: writable(false),
		tabs: writable([]),
		levelUpTabs: writable([]),
		actorInGame: writable(null),
		abilityGenerationMethod: writable(null),
		subClassesForClass: writable([]),
		goldRoll: writable(0),
		readOnlyTabs: writable([]),
		isLevelUp: writable(false),
		classUuidForLevelUp: writable(null),
		subClassUuidForLevelUp: writable(null),
		newLevelValueForExistingClass: writable(false),
		selectedMultiClassUUID: writable(false),
		levelUpClassObject: writable(null),
		levelUpSubClassObject: writable(null),
		activeRowClassKey: writable(null),
		levelUpCombinedHtml: writable(''),
		levelUpRichHTML: writable(''),
		levelUpRichSubClassHTML: writable(''),
	};
});
vi.mock('../../src/stores/storeDefinitions.js', () => {
	const { writable } = require('svelte/store');
	return {
		race: writable(false),
		subRace: writable(false),
		background: writable(false),
		characterClass: writable(false),
		characterSubClass: writable(false),
		abilities: writable(false),
		spells: writable(false),
		pointBuyScoreTotal: writable(12),
		pointBuyLimit: writable(27),
		abilityRolls: writable(false),
		isStandardArrayValues: writable(false),
		level: writable(1),
		activeTab: writable(''),
		isActorCreated: writable(false),
		tabs: writable([]),
		levelUpTabs: writable([]),
		actorInGame: writable(null),
		abilityGenerationMethod: writable(null),
		subClassesForClass: writable([]),
		goldRoll: writable(0),
		readOnlyTabs: writable([]),
		isLevelUp: writable(false),
		classUuidForLevelUp: writable(null),
		subClassUuidForLevelUp: writable(null),
		newLevelValueForExistingClass: writable(false),
		selectedMultiClassUUID: writable(false),
		levelUpClassObject: writable(null),
		levelUpSubClassObject: writable(null),
		activeRowClassKey: writable(null),
		levelUpCombinedHtml: writable(''),
		levelUpRichHTML: writable(''),
		levelUpRichSubClassHTML: writable(''),
	};
});

vi.mock('../stores/index', () => {
	const { writable } = require('svelte/store');
	return {
		preAdvancementSelections: writable({}),
		activeTab: writable(''),
		tabs: writable([]),
		readOnlyTabs: writable([]),
	};
});
vi.mock('../stores/index.js', () => {
	const { writable } = require('svelte/store');
	return {
		preAdvancementSelections: writable({}),
		activeTab: writable(''),
		tabs: writable([]),
		readOnlyTabs: writable([]),
	};
});
vi.mock('../../src/stores/index', () => {
	const { writable } = require('svelte/store');
	return {
		preAdvancementSelections: writable({}),
		activeTab: writable(''),
		tabs: writable([]),
		readOnlyTabs: writable([]),
	};
});
vi.mock('../../src/stores/index.js', () => {
	const { writable } = require('svelte/store');
	return {
		preAdvancementSelections: writable({}),
		activeTab: writable(''),
		tabs: writable([]),
		readOnlyTabs: writable([]),
	};
});

vi.mock('../stores/startingEquipment', () => {
	const { writable } = require('svelte/store');
	return {
		compatibleStartingEquipment: writable([]),
	};
});
vi.mock('../stores/startingEquipment.js', () => {
	const { writable } = require('svelte/store');
	return {
		compatibleStartingEquipment: writable([]),
	};
});
vi.mock('../../src/stores/startingEquipment', () => {
	const { writable } = require('svelte/store');
	return {
		compatibleStartingEquipment: writable([]),
	};
});
vi.mock('../../src/stores/startingEquipment.js', () => {
	const { writable } = require('svelte/store');
	return {
		compatibleStartingEquipment: writable([]),
	};
});

import { writable } from 'svelte/store';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workflowStateMachine, WORKFLOW_STATES, WORKFLOW_EVENTS } from '../helpers/WorkflowStateMachine.js';

// Mocks for Foundry/game globals
const mockHooks = { call: vi.fn() };
global.Hooks = mockHooks;
global.window = { GAS: { log: { d: vi.fn(), w: vi.fn(), e: vi.fn(), i: vi.fn() } } };
global.ui = { notifications: { error: vi.fn() } };

describe('WorkflowStateMachine - Bard, equipment and shop enabled, spells enabled', () => {
	beforeEach(() => {
		workflowStateMachine.reset();
		mockHooks.call.mockClear();
		global.game = {
			settings: {
				get: vi.fn((module, key) => {
					if (key === 'enableEquipmentSelection') return true;
					if (key === 'enableSpellSelection') return true;
					if (key === 'enableEquipmentPurchase') return true;
					return false;
				}),
			},
		};
		// Set preAdvancementSelections and compatibleStartingEquipment for equipment selection
		const { preAdvancementSelections } = require('../stores/index.js');
		const { compatibleStartingEquipment } = require('../stores/startingEquipment.js');
		preAdvancementSelections.set({
			class: {
				system: {
					startingEquipment: [{ _id: 'eq1', type: 'linked' }],
					wealth: 10,
				},
			},
		});
		compatibleStartingEquipment.set([{ _id: 'eq1', type: 'linked' }]);
	});

	it('should show spells tab after equipment and shop for a bard (spellcaster)', async () => {
		// Simulate a Bard (spellcaster) actor
		const actor = {
			name: 'Test Bard',
			classes: {
				bard: {
					system: {
						spellcasting: {
							progression: 'full',
						},
					},
				},
			},
			sheet: { render: vi.fn() },
		};

		// Go through the workflow step by step
		await workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
		expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.CREATING_CHARACTER);

		await workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor });
		expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.PROCESSING_ADVANCEMENTS);

		await workflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor });
		expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.SELECTING_EQUIPMENT);

		await workflowStateMachine.transition(WORKFLOW_EVENTS.EQUIPMENT_COMPLETE, { actor });
		expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.SHOPPING);

		await workflowStateMachine.transition(WORKFLOW_EVENTS.SHOPPING_COMPLETE, { actor });
		// This is where the bug is: it should go to SELECTING_SPELLS, but goes to COMPLETED
		expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.SELECTING_SPELLS);
	});
});
