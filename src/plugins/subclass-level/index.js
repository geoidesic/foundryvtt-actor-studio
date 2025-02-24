import { MODULE_ID } from '../../helpers/constants';

export default class SubclassLevelPlugin {
  static ID = 'subclass-level';

  /**
   * Initialize the plugin
   */
  static init() {

    const dnd5eVersion = game.system.version.split('.')[0];
    if (dnd5eVersion > 3) {
      game.system.log.i('Subclass Level Plugin is not supported for DND5E version 3 and above, as it is now handled by the DND5E system.');
      return false;
    }

    this.registerHooks();
  }

  /**
   * Register necessary hooks
   */
  static registerHooks() {
    // Hook into advancement selection rendering
    Hooks.on('renderAdvancementSelection', this._onRenderAdvancementSelection.bind(this));
    Hooks.on('renderItemSheet5e', this._onRenderItemSheet5e.bind(this));

  }

  /**
   * Handle rendering the advancement selection interface
   */
  static async _onRenderAdvancementSelection(app, html, data) {

    // Only proceed if this is a class item
    const item = app.item;
    if (!item || item.type !== 'class') return;

    // Add our subclass option to the types list
    game.system.log.d('html', html);
    game.system.log.d('$(html)', $(html));
    const typeList = html.find('.items-list');
    html.addClass('gas dnd5e v3x')
    game.system.log.d('Type List: ', typeList);
    const subclassOption = `
      <li class="item flexrow">
        <div class="item-name flexrow">
          <div class="item-image" style="background-image: url('systems/dnd5e/icons/svg/items/subclass.svg')"></div>
          <h3>Subclass</h3>
        </div>
        <div class="item-controls flexrow">
          <input name="type" type="radio" value="Subclass">
        </div>
        <div class="item-hint notes">
          Specify what level this class receives its subclass.
        </div>
      </li>
    `;
    typeList.append(subclassOption);
    const button = html.find('[data-button="submit"]');
    game.system.log.d('Button: ', button);
    button.off('click').on('click', async function(event) {
      event.preventDefault();
      const selectedType = html.find('input[name="type"]:checked').val();
      if (selectedType === 'Subclass') {
        await SubclassLevelPlugin._showLevelDialog(item);
        app.close();
      }
    });
  }

  /**
   * Show dialog for setting subclass level
   */
  static async _showLevelDialog(item) {
    const currentLevel = this.getSubclassLevel(item);
    const content = `
      <form>
        <div class="form-group">
          <label>Select Level</label>
          <select name="level">
            ${Array.from({ length: 20 }, (_, i) => i + 1).map(level =>
      `<option value="${level}" ${currentLevel === level ? 'selected' : ''}>${level}</option>`
    ).join('')}
          </select>
        </div>
      </form>
    `;

    const dialog = new Dialog({
      title: `Set Subclass Level for ${item.name}`,
      content,
      buttons: {
        submit: {
          label: "Save",
          callback: async (html) => {
            const level = Number(html.find('[name="level"]').val());
            await this.setSubclassLevel(item, level);
          }
        },
        cancel: {
          label: "Cancel"
        }
      },
      default: "submit"
    });

    dialog.render(true);
  }

  static _onRenderItemSheet5e(app, html, data) {
    game.system.log.d('_onRenderItemSheet5e called');
    // Only proceed if this is a class item
    const item = app.item;
    game.system.log.d('item.type', item.type);
    if (!item || item.type !== 'class') return;

    // Add click listener to advancement tab
    html.find('a.item[data-tab="advancement"]').on('click', () => {
      // Small delay to ensure tab is active when we re-render
      setTimeout(() => app.render(false), 0);
    });

    // Only proceed with subclass rendering if advancement tab is active
    if (!html.find('.tab.advancement.active').length) return;

    game.system.log.d('html', html);

    const subclassLevel = this.getSubclassLevel(item);
    game.system.log.d('subclassLevel', subclassLevel);
    if (!subclassLevel) return;

    // Find the level group where we should insert the subclass
    const levelHeader = html.find(`[data-level="${subclassLevel}"]`);
    game.system.log.d('levelHeader', levelHeader);
    if (!levelHeader.length) return;

    // Find the items-list that's a sibling of the level header
    const itemsList = html.find(`[data-level="${subclassLevel}"] + .item-list`);
    // const itemsList = levelHeader.siblings('.item-list');
    game.system.log.d('itemsList', itemsList);
    if (!itemsList.length) return;

    // Create the subclass advancement entry
    const subclassEntry = `
      <li class="advancement-item item flexrow" data-advancement-type="subclass">
        <div class="item-name flexrow">
          <div class="item-image" style="background-image: url('systems/dnd5e/icons/svg/items/subclass.svg')"></div>
          <h4>Subclass</h4>
        </div>
        <div class="item-controls flexrow">
          <a class="item-control item-edit" title="Edit Subclass Level"><i class="fas fa-edit"></i></a>
          <a class="item-control item-delete" title="Delete Subclass Level"><i class="fas fa-trash"></i></a>
        </div>
      </li>
    `;
    itemsList.append(subclassEntry);

    // Add edit handler
    html.find('[data-advancement-type="subclass"] .item-edit').on('click', async () => {
      await this._showLevelDialog(item);
    });

    // Add delete handler
    html.find('[data-advancement-type="subclass"] .item-delete').on('click', async () => {
      const confirmed = await Dialog.confirm({
        title: "Delete Subclass Level",
        content: `<p>Are you sure you want to remove the subclass level from ${item.name}?</p>`,
        defaultYes: false
      });
      
      if (confirmed) {
        await item.unsetFlag(MODULE_ID, 'subclassLevel');
        app.render();
      }
    });
  }

  /**
   * Get the stored subclass level
   * @param {Item} item - The class item
   * @returns {number|null} The stored level or null
   */
  static getSubclassLevel(item) {
    return item.getFlag(MODULE_ID, 'subclassLevel') || null;
  }

  /**
   * Set the subclass level
   * @param {Item} item - The class item
   * @param {number} level - The level to set
   */
  static async setSubclassLevel(item, level) {
    await item.setFlag(MODULE_ID, 'subclassLevel', level);
  }
} 