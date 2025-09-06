import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
import NPCSheetShell from "~/src/app/NPCSheetShell.svelte";
import { MODULE_ID, MODULE_CODE } from "~/src/helpers/constants";
import HeaderEditToggle from "~/src/components/atoms/HeaderEditToggle.svelte";
import { writable } from 'svelte/store';

/**
 * GAS NPC Sheet Application (TJS SvelteApplication)
 * Simple, statblock-focused actor sheet for NPCs.
 */
export default class NPCSheetApplication extends SvelteApplication {
  /** @type {TJSDocument<foundry.abstract.Document>} */
  documentStore = new TJSDocument(void 0, { delete: this.close.bind(this) });

  /** Keep a reference to unsubscribe function */
  #storeUnsubscribe;

  /** Shared edit mode store (header + shell) */
  editStore = writable(false);

  constructor(actor) {
    super(actor);
    Object.defineProperty(this.reactive, "document", {
      get: () => this.documentStore.get(),
      set: (document) => this.documentStore.set(document),
    });
    this.reactive.document = actor;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'gas-npc-statblock-sheet',
      title: game.i18n.localize('GAS.NPCStatblockSheet') || 'NPC',
      classes: [MODULE_CODE, 'gas-npc-sheet'],
      width: 720,
      height: 840,
      resizable: true,
      minimizable: true,
      headerIcon: 'modules/foundryvtt-actor-studio/assets/actor-studio-logo-dragon-blue.png',
      svelte: {
        class: NPCSheetShell,
        target: document.body,
        props: function () {
          const storeRef = this.documentStore; // capture lexical ref
          return {
            documentStore: storeRef,
            document: this.reactive.document,
            canEdit: this.reactive.document?.isOwner ?? false,
            editStore: this.editStore
          };
        }
      }
    });
  }

  /**
   * Add a left-aligned slide-toggle to the header using TRL's header button API.
   */
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();

    const canEdit = this.reactive.document?.isOwner ?? false;

    // Insert our svelte header control at the far left (after the title)
    buttons.unshift({
      alignLeft: true,
      svelte: { class: HeaderEditToggle, props: { editStore: this.editStore, canEdit } }
    });

    return buttons;
  }

  async #handleDocUpdate(doc, options) {
    if (!doc) return;
    const tokenText = doc.flags?.[MODULE_ID]?.tokenName ? ` (${doc.flags[MODULE_ID].tokenName})` : '';
    this.reactive.title = `${game.i18n.localize('GAS.NPCStatblockSheet')} - ${doc.name}${tokenText}`;
  }

  render(force=false, options={}) {
  if (!this.#storeUnsubscribe) this.#storeUnsubscribe = this.documentStore.subscribe(this.#handleDocUpdate.bind(this));
    super.render(force, options);
    return this;
  }

  async close(options={}) {
    await super.close(options);
    if (this.#storeUnsubscribe) {
      this.#storeUnsubscribe();
      this.#storeUnsubscribe = void 0;
    }
  }
}
