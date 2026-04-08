import { MODULE_ID } from '../../helpers/constants';

export default class SpellsKnownPlugin {
  static ID = 'spells-known';
  static currentItem = null;

  static init() {
    this.registerHooks();
  }

  static registerHooks() {
    Hooks.on('renderAdvancementSelection', this._onRenderAdvancementSelection.bind(this));
    Hooks.on('renderDialog', this._onRenderDialog.bind(this));
    Hooks.on('renderItemSheet5e', (app) => {
      if (app.item && (app.item.type === 'class' || app.item.type === 'subclass')) {
        SpellsKnownPlugin.currentItem = app.item;
      }
    });
  }

  static _supportsItem(item) {
    return item && (item.type === 'class' || item.type === 'subclass');
  }

  static _appendOption(list) {
    list.append(`
      <li data-tooltip="Add a Scale Value advancement for new spells known at this level.">
        <label>
          <dnd5e-icon src="systems/dnd5e/icons/svg/items/spell.svg"></dnd5e-icon>
          <span>Spells Known</span>
          <input type="radio" name="type" value="SpellsKnown" required="">
        </label>
      </li>
    `);
  }

  static async _onRenderAdvancementSelection(app, html) {
    html = html instanceof jQuery ? html : $(html);
    const item = app.item;
    if (!this._supportsItem(item)) return;

    const list = html.find('.items-list');
    if (!list.length) return;
    this._appendOption(list);

    const button = html.find('[data-button="submit"]');
    const originalClickHandler = $._data(button[0], 'events')?.click?.[0]?.handler;
    button.off('click').on('click', async (event) => {
      const selectedType = html.find('input[name="type"]:checked').val();
      if (selectedType === 'SpellsKnown') {
        await this._showDialog(item);
        app.close();
        return;
      }
      if (originalClickHandler) originalClickHandler.call(button[0], event);
    });
  }

  static async _onRenderDialog(app, html) {
    html = html instanceof jQuery ? html : $(html);
    const hasRadioButtons = html.find('input[name="type"][type="radio"]').length > 0;
    if (!hasRadioButtons) return;

    const item = SpellsKnownPlugin.currentItem;
    if (!this._supportsItem(item)) return;

    const list = html.find('ol, ul').first();
    if (!list.length) return;
    this._appendOption(list);

    const originalSubmit = app.data.buttons.ok.callback;
    app.data.buttons.ok.callback = async (htmlArg) => {
      const wrapped = htmlArg instanceof jQuery ? htmlArg : $(htmlArg);
      const selectedType = wrapped.find('input[name="type"]:checked').val();
      if (selectedType === 'SpellsKnown') {
        await this._showDialog(item);
        return null;
      }
      if (originalSubmit) return originalSubmit.call(this, htmlArg);
      return null;
    };
  }

  static async _showDialog(item) {
    return new Dialog({
      title: `Add Spells Known for ${item.name}`,
      content: `
        <form>
          <div class="form-group">
            <label>Level</label>
            <select name="level">
              ${Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) =>
                `<option value="${lvl}">${lvl}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Spells Known</label>
            <input type="number" name="value" min="0" step="1" value="1">
          </div>
        </form>
      `,
      buttons: {
        submit: {
          label: 'Save',
          callback: async (html) => {
            const level = Number(html.find('[name="level"]').val()) || 1;
            const value = Math.max(0, Number(html.find('[name="value"]').val()) || 0);
            await this.upsertSpellsKnownAdvancement(item, level, value);
          }
        },
        cancel: { label: 'Cancel' }
      },
      default: 'submit'
    }).render(true);
  }

  static async upsertSpellsKnownAdvancement(item, level, value) {
    const advancements = Array.isArray(item.system?.advancement)
      ? foundry.utils.deepClone(item.system.advancement)
      : [];

    const existingIndex = advancements.findIndex((adv) =>
      adv?.type === 'ScaleValue'
      && String(adv?.title || '').toLowerCase() === 'spells known'
      && Number(adv?.level || 0) === Number(level)
    );

    const payload = {
      _id: foundry.utils.randomID(),
      type: 'ScaleValue',
      title: 'Spells Known',
      level: Number(level) || 1,
      value: Number(value) || 0,
      icon: 'systems/dnd5e/icons/svg/items/spell.svg'
    };

    if (existingIndex >= 0) {
      advancements[existingIndex] = { ...advancements[existingIndex], ...payload, _id: advancements[existingIndex]._id };
    } else {
      advancements.push(payload);
    }

    await item.update({ 'system.advancement': advancements });
    ui.notifications?.info(`Updated Spells Known at level ${level} for ${item.name}`);
  }
}
