import NPCAppShell from './NPCAppShell.svelte';
import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
import { MODULE_ID, MODULE_CODE } from "~/src/helpers/constants"
import { activeTab, actorInGame, isAdvancementInProgress } from "~/src/stores/index";
import { get } from 'svelte/store';
import { getNPCWorkflowFSM, NPC_WORKFLOW_EVENTS, npcWorkflowFSMContext } from "~/src/helpers/NPC/WorkflowStateMachine";

import { version } from "../../module.json";

export default class NPCApplication extends SvelteApplication {
  /**
   * Document store that monitors updates to any assigned document.
   *
   * @type {TJSDocument<foundry.abstract.Document>}
   */
  #documentStore = new TJSDocument(void 0, { delete: this.close.bind(this) });

  /**
   * Holds the document unsubscription function.
   *
   * @type {Function}
   */
  #storeUnsubscribe;

  /**
   * NPC workflow state machine instance
   */
  #npcWorkflowFSM;

  /**
   * This mechanism is necessary because the app can be closed in two ways:
   * 1. By clicking the close button in the header
   * 2. Automatically by triggering the gas.close hook (e.g. when the workflow is complete)
   * We need to ensure that the gas.close hook is only triggered once, 
   * so we use this flag to track whether the app is being closed by the gas.close hook.
   */
  #isClosingFromGasHook = false;
  setClosingFromGasHook(value) {
    this.#isClosingFromGasHook = value;
  }

  constructor(object) {
    super(object);

    // Define document store property
    Object.defineProperty(this.reactive, "document", {
      get: () => this.#documentStore.get(),
      set: (document) => {
        this.#documentStore.set(document);
      },
    });
    this.reactive.document = object;

    // Initialize the NPC workflow state machine
    this.#npcWorkflowFSM = getNPCWorkflowFSM();
    
    // Start the workflow
    this.#npcWorkflowFSM.handle(NPC_WORKFLOW_EVENTS.START_NPC_SELECTION);
  }

  /**
   * Default Application options
   *
   * @returns {object} options - Application options.
   * @see https://foundryvtt.com/api/Application.html#options
   */
  static get defaultOptions() {
    const title = this.title;
    // Get dnd5e version, foundry version, and dnd5e rule set from window.GAS (set in init.js)
    const dnd5eVersion = window.GAS?.dnd5eVersion || '';
    const foundryVersion = game.version || '';
    const dnd5eRules = window.GAS?.dnd5eRules || '';
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'foundryvtt-actor-studio-npc-sheet',
      title: `${game.i18n.localize('GAS.ActorStudio')} v${version} | Foundry: ${foundryVersion} | dnd5e: ${dnd5eVersion} | Rules: ${dnd5eRules}`,
      classes: [MODULE_CODE],
      width: game.settings.get(MODULE_ID, 'windowX') || 700,
      height: game.settings.get(MODULE_ID, 'windowX') || 800,
      headerIcon: 'modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-blue.png',
      minWidth: 500,
      padding: 0,
      resizable: true,
      focusAuto: false,
      minimizable: true,
      svelte: {
        class: NPCAppShell,
        target: document.body,
        props: function () {
          return { 
            documentStore: this.#documentStore, 
            document: this.reactive.document,
            npcWorkflowFSM: this.#npcWorkflowFSM
          };
        },
      },
    });
  }

  /**
   * Gets the header buttons configuration for the sheet
   * @return {Array<object>} Returns an array of button configurations for the sheet header
   */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    
    // Find the close button
    const closeIndex = buttons.findIndex(button => button.class === 'close');
    if (closeIndex === -1) return buttons;
    
    // Modify the close button's onClick handler
    buttons[closeIndex].onclick = async (ev) => {
      const currentTab = get(activeTab);
      const actor = get(actorInGame);
     
      this.close();
    };

    return buttons;
  }

  /**
   * Drag&Drop handling
   */
  _canDragStart(selector) {
    return true;
  }
  _canDragDrop(selector) {
    return this.reactive.document.isOwner || game.user.isGM;
  }
  _onDragOver(event) { }

  _onDragStart(event) {

  }

  async _onDrop(event) {

  }


  /**
   * Handles any changes to document.
   *
   * @param {foundry.abstract.Document}  doc -
   *
   * @param {object}                     options -
   */
  async #handleDocUpdate(doc, options) {
    const { action, data, documentType } = options;
    if ((action === void 0 || action === "update" || action === "subscribe") && doc) {
      const isDebug = game.settings.get(MODULE_ID, 'debug');
      const moduleVersion = game.modules.get(MODULE_ID)?.version;
      const tokenText = doc.flags?.[MODULE_ID]?.tokenName ? ` (${doc.flags[MODULE_ID].tokenName})` : "";
      this.reactive.title = `${game.i18n.localize('GAS.ActorStudio')} - ${isDebug ? moduleVersion : ''} [${window.GAS.dnd5eRules}] - ${game.i18n.localize('GAS.NPCTitle')} - ${doc.name} ${tokenText}`;
    }
  }

  render(force = false, options = {}) {
    if (!this.#storeUnsubscribe) {
      this.#storeUnsubscribe = this.#documentStore.subscribe(this.#handleDocUpdate.bind(this));
    }
    super.render(force, options);
    return this;
  }

  async close(options = {}) {
    // Only trigger gas.close hook if we're not already being closed by the gas.close hook
    if (!this.#isClosingFromGasHook) {
      console.log('[NPCApplication] User closed Actor Studio - triggering gas.close hook for cleanup');
      Hooks.call("gas.close");
      return; // gasClose will call this.close() again with the flag set
    }
    
    console.log('[NPCApplication] Closing application (called from gasClose)');
    await super.close(options);

    if (this.#storeUnsubscribe) {
      this.#storeUnsubscribe();
      this.#storeUnsubscribe = void 0;
    }
    
    // Reset the flag for next time
    this.#isClosingFromGasHook = false;
  }
}