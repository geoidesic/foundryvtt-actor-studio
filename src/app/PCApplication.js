import PCAppShell                from './PCAppShell.svelte';
import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";

export default class PCApplication extends SvelteApplication
{
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
  }

  /**
   * Default Application options
   *
   * @returns {object} options - Application options.
   * @see https://foundryvtt.com/api/Application.html#options
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {         
      id: 'foundryvtt-actor-studio-pc-sheet',
      title: game.i18n.localize('GAS.ActorStudio')+' - '+game.i18n.localize('GAS.PCTitle'),  // Automatically localized from `lang/en.json`.
      classes: ['gas-actor-studio'],
      width: 500,
      height: 600,
      minWidth: 500,
      resizable: true,
      focusAuto: false,
      minimizable: true,
      svelte: {
        class: PCAppShell,
        target: document.body,
        props: function () {
          return { documentStore: this.#documentStore, document: this.reactive.document };
        },
      },
    });
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

  async close(options = {}) {
    await super.close(options);

    if (this.#storeUnsubscribe) {
      this.#storeUnsubscribe();
      this.#storeUnsubscribe = void 0;
    }
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
      this.reactive.title += (' - '+doc.name);
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