import PCAppShell from './PCAppShell.svelte';
import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
import { MODULE_ID, MODULE_CODE } from "~/src/helpers/constants"
import { activeTab, actorInGame, isAdvancementInProgress } from "~/src/stores/index";
import { get } from 'svelte/store';
import { version } from "../../module.json";

export default class PCApplication extends SvelteApplication {
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

  constructor(object, levelUp = false) {
    super(object);

    // Define document store property
    Object.defineProperty(this.reactive, "document", {
      get: () => this.#documentStore.get(),
      set: (document) => {
        this.#documentStore.set(document);
      },
    });
    this.reactive.document = object;
    this.levelUp = levelUp
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
      id: 'foundryvtt-actor-studio-pc-sheet',
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
        class: PCAppShell,
        target: document.body,
        props: function () {
          return { documentStore: this.#documentStore, document: this.reactive.document, levelUp: this.levelUp  };
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
      
      // Only show confirmation if advancements tab is active
      if (get(isAdvancementInProgress)) {
        const confirmed = await Dialog.confirm({
          title: 'Close',
          content: 'Are you sure you want to close? If you have incomplete advancements, they will be lost.',
          yes: () => true,
          no: () => false,
          defaultYes: false
        });
        
        if (confirmed) {
          this.close();
        }
      } else {
        // If not on advancements tab, just close normally
        this.close();
      }
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

  #isClosingFromGasHook = false;
  
  setClosingFromGasHook(value) {
    this.#isClosingFromGasHook = value;
  }

  async close(options = {}) {
    // Only trigger gas.close hook if we're not already being closed by the gas.close hook
    if (!this.#isClosingFromGasHook) {
      console.log('[PCApplication] User closed Actor Studio - triggering gas.close hook for cleanup');
      Hooks.call("gas.close");
      return; // gasClose will call this.close() again with the flag set
    }
    
    console.log('[PCApplication] Closing application (called from gasClose)');
    await super.close(options);

    if (this.#storeUnsubscribe) {
      this.#storeUnsubscribe();
      this.#storeUnsubscribe = void 0;
    }
    
    // Reset the flag for next time
    this.#isClosingFromGasHook = false;
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
      this.reactive.title = `${game.i18n.localize('GAS.ActorStudio')} - ${isDebug ? moduleVersion : ''} [${window.GAS.dnd5eRules}] - ${game.i18n.localize('GAS.PCTitle')} - ${doc.name} ${tokenText}`;
    }
  }

  render(force = false, options = {}) {
    if (!this.#storeUnsubscribe) {
      this.#storeUnsubscribe = this.#documentStore.subscribe(this.#handleDocUpdate.bind(this));
    }
    super.render(force, options);
    return this;
  }

}