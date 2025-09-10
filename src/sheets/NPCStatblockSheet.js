import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
import NPCSheetShell from "~/src/app/NPCSheetShell.svelte";
import { MODULE_CODE } from "~/src/helpers/constants";

/**
 * GAS NPC Statblock Sheet (TJS SvelteApplication)
 * Standalone app that acts as the NPC sheet UI.
 */
export default class NPCStatblockSheet extends SvelteApplication {
  /** @type {TJSDocument<foundry.documents.BaseActor>} */
  #documentStore = new TJSDocument(void 0, { delete: this.close.bind(this) });
  #storeUnsubscribe;

  constructor(actorDocument) {
    super(actorDocument);

    // Bind TJS document store to this.reactive.document just like NPCApplication
    Object.defineProperty(this.reactive, "document", {
      get: () => this.#documentStore.get(),
      set: (document) => this.#documentStore.set(document),
    });
    this.reactive.document = actorDocument;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'gas-npc-statblock-sheet',
      title: 'GAS.NPCStatblockSheet',
      classes: [MODULE_CODE, 'gas-npc-statblock'],
      width: 700,
      height: 800,
      minWidth: 500,
      padding: 0,
      resizable: true,
      focusAuto: false,
      minimizable: true,
      svelte: {
        class: NPCSheetShell,
        target: document.body,
        props: function () {
          return {
            documentStore: this.#documentStore,
            document: this.reactive.document,
            editable: true
          };
        },
      },
    });
  }

  async #handleDocUpdate(doc, options) {
    if (!doc) return;
    const tokenText = doc.flags?.['foundryvtt-actor-studio']?.tokenName ? ` (${doc.flags['foundryvtt-actor-studio'].tokenName})` : '';
    this.reactive.title = `${doc.name}${tokenText}`;
  }

  render(force = false, options = {}) {
    if (!this.#storeUnsubscribe) {
      this.#storeUnsubscribe = this.#documentStore.subscribe(this.#handleDocUpdate.bind(this));
    }
    return super.render(force, options);
  }

  async close(options = {}) {
    await super.close(options);
    if (this.#storeUnsubscribe) {
      this.#storeUnsubscribe();
      this.#storeUnsubscribe = void 0;
    }
  }
}
