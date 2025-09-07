import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { TJSDocument } from "@typhonjs-fvtt/runtime/svelte/store/fvtt/document";
import NPCSheetShell from "~/src/app/NPCSheetShell.svelte";
import { MODULE_ID, MODULE_CODE } from "~/src/helpers/constants";
import HeaderEditToggle from "~/src/components/atoms/HeaderEditToggle.svelte";
import HeaderIconButton from "~/src/components/atoms/HeaderIconButton.svelte";
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

    // Ensure each window instance has a unique element id so multiple can be opened
    try {
      const aid = actor?.id || actor?._id || foundry.utils.randomID?.() || Math.random().toString(36).slice(2);
      this.options.id = `gas-npc-statblock-sheet-${aid}`;
    } catch (_) {
      this.options.id = `gas-npc-statblock-sheet-${Math.random().toString(36).slice(2)}`;
    }
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      // id is set per-instance in the constructor to allow multiple windows
      id: 'gas-npc-statblock-sheet',
      title: this.reactive?.document?.name,
      classes: ['window-app', MODULE_CODE, 'gas-npc-sheet'],
      width: 280,
      height: 500,
      minWidth: 280,
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

    // Preserve common Actor sheet tools: Configure Sheet and Configure Token
    const doc = this.reactive.document;
    if (doc) {
      // Configure Sheet button
      buttons.push({
        svelte: {
          class: HeaderIconButton,
          props: {
            extraClass: 'configure-sheet flex0',
            iconClass: 'fa-solid fa-gear fas fa-cog',
            title: game?.i18n?.localize?.('GAS.Header.ConfigureSheet') || 'Configure Sheet',
            onPress: () => {
          try {
            // DocumentSheetConfig is provided by Foundry core
            // eslint-disable-next-line no-undef
            new DocumentSheetConfig(doc, {
              top: this.position.top + 40,
              left: this.position.left + 40
            }).render(true);
          } catch (e) {
            console.warn('[GAS][NPC-SHEET] Failed to open DocumentSheetConfig', e);
          }
            }
          }
        }
      });

      // Configure Token button (for prototype token or placed token)
      const tokenDoc = doc.isToken ? doc.token : doc.prototypeToken;
      if (tokenDoc) {
        buttons.push({
          svelte: {
            class: HeaderIconButton,
            props: {
              extraClass: 'configure-token flex0',
              iconClass: 'fa-solid fa-circle-user fas fa-user-circle far fa-user-circle',
              title: doc.isToken
                ? (game?.i18n?.localize?.('GAS.Header.ConfigureToken') || 'Configure Token')
                : (game?.i18n?.localize?.('GAS.Header.PrototypeToken') || 'Prototype Token'),
              onPress: () => {
            try {
              // TokenConfig is provided by Foundry core
              // eslint-disable-next-line no-undef
              new TokenConfig(tokenDoc, {
                top: this.position.top + 60,
                left: this.position.left + 60
              }).render(true);
            } catch (e) {
              console.warn('[GAS][NPC-SHEET] Failed to open TokenConfig', e);
            }
              }
            }
          }
        });

        // View Character Artwork
        if (doc.img) {
          buttons.push({
            svelte: {
              class: HeaderIconButton,
              props: {
                extraClass: 'view-character-art flex0',
                iconClass: 'fa-solid fa-image fas fa-image',
                title: game?.i18n?.localize?.('GAS.Header.ViewCharacterArtwork') || 'View Character Artwork',
                onPress: () => {
              try {
                // eslint-disable-next-line no-undef
                new ImagePopout(doc.img, { title: doc.name }).render(true);
              } catch (e) {
                console.warn('[GAS][NPC-SHEET] Failed to open character artwork', e);
              }
                }
              }
            }
          });
        }

        // View Token Artwork (prototype or placed)
        const tokenImg = tokenDoc?.texture?.src ?? tokenDoc?.img;
        if (tokenImg) {
          buttons.push({
            svelte: {
              class: HeaderIconButton,
              props: {
                extraClass: 'view-token-art flex0',
                iconClass: 'fa-solid fa-images fas fa-images',
                title: game?.i18n?.localize?.('GAS.Header.ViewTokenArtwork') || 'View Token Artwork',
                onPress: () => {
              try {
                // eslint-disable-next-line no-undef
                new ImagePopout(tokenImg, { title: `${doc.name} — Token` }).render(true);
              } catch (e) {
                console.warn('[GAS][NPC-SHEET] Failed to open token artwork', e);
              }
                }
              }
            }
          });
        }

        // Copy Document UUID
        buttons.push({
          svelte: {
            class: HeaderIconButton,
            props: {
              extraClass: 'copy-uuid flex0',
              iconClass: 'fa-solid fa-copy fas fa-copy',
              title: game?.i18n?.localize?.('GAS.Header.CopyDocumentUUID') || 'Copy Document UUID',
              onPress: async () => {
            try {
              const uuid = doc?.uuid ?? '';
              if (!uuid) return;
              if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(uuid);
              } else {
                // Fallback
                const ta = document.createElement('textarea');
                ta.value = uuid;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                try { document.execCommand('copy'); } catch (_) { /* noop */ }
                document.body.removeChild(ta);
              }
              ui?.notifications?.info?.(game?.i18n?.localize?.('GAS.Header.CopiedUUID') || 'Copied UUID to clipboard');
            } catch (e) {
              console.warn('[GAS][NPC-SHEET] Failed to copy UUID', e);
            }
              }
            }
          }
        });
      }
    }

    // Ensure the close button renders last in the header
    try {
      const idx = buttons.findIndex((b) => {
        const cls = `${b?.class ?? b?.classes ?? ''}`;
        const icon = `${b?.icon ?? ''}`;
        const title = `${b?.title ?? ''}`.toLowerCase?.() || '';
        return cls.includes('close') || icon.includes('fa-times') || icon.includes('fa-xmark') || title.includes('close');
      });
      if (idx >= 0 && idx < buttons.length - 1) {
        const [closeBtn] = buttons.splice(idx, 1);
        buttons.push(closeBtn);
      }
    } catch (e) {
      // no-op; if anything goes wrong just return buttons as-is
    }

    return buttons;
  }

  async #handleDocUpdate(doc, options) {
    if (!doc) return;
    const tokenText = doc.flags?.[MODULE_ID]?.tokenName ? ` (${doc.flags[MODULE_ID].tokenName})` : '';
    this.reactive.title = `${doc.name}${tokenText}`;
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
