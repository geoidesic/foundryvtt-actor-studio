import { localize as t } from '~/src/helpers/Utility';

/**
 * Replacement for Document.prototype.importFromJSONDialog that adds a text area option.
 * @this {ClientDocument}
 * @returns {Promise<void>}
 */
async function gasCustomImportFromJSONDialog() {
  const self = this;

  const methodLabel     = t("Import.Method");
  const fromFileLabel   = t("Import.FromFile");
  const fromTextLabel   = t("Import.FromText");
  const sourceLabel     = game.i18n.localize("DOCUMENT.ImportSource");
  const jsonTextLabel   = t("Import.JSONText");
  const hint1           = game.i18n.format("DOCUMENT.ImportDataHint1", { document: this.documentName });
  const hint2           = game.i18n.format("DOCUMENT.ImportDataHint2", { name: this.name });

  const content = [
    '<form autocomplete="off" onsubmit="event.preventDefault();">',
    '  <p class="hint">' + hint1 + '</p>',
    '  <p class="hint">' + hint2 + '</p>',
    '  <div class="form-group">',
    '    <label>' + methodLabel + '</label>',
    '    <div class="form-fields">',
    '      <select name="import-method">',
    '        <option value="file">' + fromFileLabel + '</option>',
    '        <option value="text">' + fromTextLabel + '</option>',
    '      </select>',
    '    </div>',
    '  </div>',
    '  <div class="form-group" id="gas-file-group">',
    '    <label>' + sourceLabel + '</label>',
    '    <div class="form-fields"><input type="file" name="data" accept=".json"></div>',
    '  </div>',
    '  <div class="form-group" id="gas-text-group" style="display:none;">',
    '    <label>' + jsonTextLabel + '</label>',
    '    <div class="form-fields">',
    '      <textarea name="json-text" rows="10" placeholder=\'{"name": "..."}\'></textarea>',
    '    </div>',
    '  </div>',
    '</form>'
  ].join('\n');

  // Attach toggle listener once the dialog renders
  Hooks.once('renderDialogV2', (_app, html) => {
    const select    = html.querySelector('[name="import-method"]');
    const fileGroup = html.querySelector('#gas-file-group');
    const textGroup = html.querySelector('#gas-text-group');
    if (!select) return;
    select.addEventListener('change', () => {
      fileGroup.style.display = select.value === 'file' ? '' : 'none';
      textGroup.style.display = select.value === 'text' ? '' : 'none';
    });
  });

  await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("DOCUMENT.ImportData") + ': ' + this.name },
    position: { width: 480 },
    content,
    buttons: [{
      action: "import",
      label: "Import",
      icon: "fa-solid fa-file-import",
      default: true,
      callback: async (event, button) => {
        const form = button.form
          ?? button.closest('form')
          ?? button.closest('dialog')?.querySelector('form');
        if (!form) return;

        const method = form.querySelector('[name="import-method"]')?.value ?? 'file';
        let json;

        if (method === 'file') {
          const fileInput = form.querySelector('input[name="data"]');
          if (!fileInput?.files?.length) {
            ui.notifications.error("DOCUMENT.ImportDataError", { localize: true });
            return;
          }
          json = await foundry.utils.readTextFromFile(fileInput.files[0]);
        } else {
          json = (form.querySelector('[name="json-text"]')?.value ?? '').trim();
          if (!json) {
            ui.notifications.error(t("Import.NoJSONProvided"));
            return;
          }
          try {
            JSON.parse(json);
          } catch (e) {
            ui.notifications.error(`Invalid JSON: ${e.message}`);
            return;
          }
        }

        await self.importFromJSON(json);
      }
    }, {
      action: "no",
      label: "Cancel",
      icon: "fa-solid fa-xmark"
    }]
  });
}

/**
 * Patch the importFromJSONDialog method on every document class registered in CONFIG,
 * covering all types (Item, Actor, RollTable, etc.) regardless of which mixin instance
 * each class inherits from — since ClientDocumentMixin() is called separately per type.
 *
 * Called directly during the 'init' hook, when all CONFIG.*.documentClass entries exist.
 */
export function initItemContextOptions() {
  const patched = new WeakSet();

  for (const cfg of Object.values(CONFIG)) {
    const docClass = cfg?.documentClass;
    if (typeof docClass !== 'function') continue;

    // Walk the prototype chain to find the exact prototype that owns importFromJSONDialog
    let proto = docClass.prototype;
    while (proto && proto !== Object.prototype) {
      if (Object.getOwnPropertyDescriptor(proto, 'importFromJSONDialog')) {
        if (!patched.has(proto)) {
          proto.importFromJSONDialog = gasCustomImportFromJSONDialog;
          patched.add(proto);
          window.GAS?.log?.d('[GAS] Patched importFromJSONDialog on', docClass.name, 'mixin prototype');
        }
        break;
      }
      proto = Object.getPrototypeOf(proto);
    }
  }
}
