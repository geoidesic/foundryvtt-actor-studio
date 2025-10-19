import { MODULE_ID } from '../../helpers/constants';

/**
 * Plugin to add "Spell Lists" advancement for custom classes/subclasses
 * This allows GMs to specify which spell lists a custom class has access to
 * 
 * Standard D&D classes (Wizard, Cleric, etc.) do NOT need this - they work via existing logic
 * This is ONLY for custom/homebrew classes that need spell list configuration
 */
export default class SpellListsPlugin {
  static ID = 'spell-lists';
  static currentItem = null; // Track the current item being edited

  /**
   * Initialize the plugin
   * Unlike SubclassLevelPlugin, this works for ALL D&D versions (v3 and v4+)
   */
  static init() {
    window.GAS.log.i('[SPELL LISTS PLUGIN] Initializing Spell Lists Plugin for custom classes');
    window.GAS.log.i('[SPELL LISTS PLUGIN] D&D 5e version:', window.GAS.dnd5eVersion);
    this.registerHooks();
  }

  /**
   * Register necessary hooks
   */
  static registerHooks() {
    window.GAS.log.i('[SPELL LISTS PLUGIN] Registering hooks');
    // Hook into advancement selection rendering
    // v3: Uses renderAdvancementSelection
    // v4+: Uses renderDialog (generic dialog system)
    Hooks.on('renderAdvancementSelection', this._onRenderAdvancementSelection.bind(this));
    Hooks.on('renderDialog', this._onRenderDialog.bind(this));
    Hooks.on('renderItemSheet5e', this._onRenderItemSheet5e.bind(this));
    
    // Track which item sheet is currently open
    Hooks.on('renderItemSheet5e', (app) => {
      if (app.item && (app.item.type === 'class' || app.item.type === 'subclass')) {
        SpellListsPlugin.currentItem = app.item;
        window.GAS.log.d('[SPELL LISTS PLUGIN] Tracking item:', app.item.name);
      }
    });
    
    window.GAS.log.i('[SPELL LISTS PLUGIN] Hooks registered successfully');
  }

  /**
   * Handle rendering the advancement selection interface
   * Adds "Spell Lists" option to the advancement type selection dialog
   */
  static async _onRenderAdvancementSelection(app, html, data) {
    // Foundry v12 vs v13+ compatibility: In v12 html is already jQuery, in v13+ it's a raw element
    html = html instanceof jQuery ? html : $(html);
    
    window.GAS.log.d('[SPELL LISTS PLUGIN] Hook fired - renderAdvancementSelection');
    window.GAS.log.d('[SPELL LISTS PLUGIN] App:', app);
    window.GAS.log.d('[SPELL LISTS PLUGIN] Item:', app.item);
    
    // Only proceed if this is a class or subclass item
    const item = app.item;
    if (!item || (item.type !== 'class' && item.type !== 'subclass')) {
      window.GAS.log.d('[SPELL LISTS PLUGIN] Skipping - item type is', item?.type);
      return;
    }

    window.GAS.log.d('[SPELL LISTS PLUGIN] Adding Spell Lists option to advancement selection');

    // Add our spell lists option to the types list
    const typeList = html.find('.items-list');
    html.addClass('gas dnd5e spell-lists-plugin');
    
    const spellListsOption = `
      <li class="item flexrow">
        <div class="item-name flexrow">
          <div class="item-image" style="background-image: url('systems/dnd5e/icons/svg/items/spell.svg')"></div>
          <h3>Spell Lists</h3>
        </div>
        <div class="item-controls flexrow">
          <input name="type" type="radio" value="SpellLists">
        </div>
        <div class="item-hint notes">
          Configure which spell lists this custom class/subclass has access to.
        </div>
      </li>
    `;
    
    typeList.append(spellListsOption);

    // Store the original click handler
    const button = html.find('[data-button="submit"]');
    const originalClickHandler = $._data(button[0], 'events')?.click?.[0]?.handler;
    
    button.off('click').on('click', async function(event) {
      const selectedType = html.find('input[name="type"]:checked').val();
      if (selectedType === 'SpellLists') {
        await SpellListsPlugin._showSpellListsDialog(item);
        app.close();
      } else if (originalClickHandler) {
        // Call the original handler for non-SpellLists selections
        originalClickHandler.call(this, event);
      }
    });
  }

  /**
   * Handle rendering generic Dialog (for D&D 5e v4+)
   * In v4+, advancement type selection uses a generic Dialog instead of AdvancementSelection
   */
  static async _onRenderDialog(app, html, data) {
    // Foundry v12 vs v13+ compatibility: In v12 html is already jQuery, in v13+ it's a raw element
    html = html instanceof jQuery ? html : $(html);
    
    window.GAS.log.i('[SPELL LISTS PLUGIN] Hook fired - renderDialog');
    window.GAS.log.i('[SPELL LISTS PLUGIN] Dialog title:', app.title);
    window.GAS.log.i('[SPELL LISTS PLUGIN] Dialog data:', data);
    
    // Check if this is the advancement type selection dialog
    // Look for "Name" as title and radio buttons for advancement types
    const hasRadioButtons = html.find('input[name="type"][type="radio"]').length > 0;
    
    window.GAS.log.i('[SPELL LISTS PLUGIN] Has radio buttons:', hasRadioButtons);
    window.GAS.log.i('[SPELL LISTS PLUGIN] Radio button count:', html.find('input[name="type"]').length);
    
    if (!hasRadioButtons) {
      window.GAS.log.d('[SPELL LISTS PLUGIN] Not an advancement type selection dialog, skipping');
      return;
    }
    
    window.GAS.log.i('[SPELL LISTS PLUGIN] Detected advancement type selection dialog!');
    
    // Get the item from our tracked reference
    const item = SpellListsPlugin.currentItem;
    if (!item) {
      window.GAS.log.w('[SPELL LISTS PLUGIN] No item is currently tracked');
      return;
    }
    
    if (item.type !== 'class' && item.type !== 'subclass') {
      window.GAS.log.d('[SPELL LISTS PLUGIN] Item is not a class or subclass:', item.type);
      return;
    }

    window.GAS.log.i('[SPELL LISTS PLUGIN] Adding Spell Lists option to dialog for item:', item.name);

    // Find the list of advancement types (it's an <ol> or <ul> with radio buttons)
    const list = html.find('ol, ul').first();
    window.GAS.log.i('[SPELL LISTS PLUGIN] Found list element:', list.length);
    
    if (!list.length) {
      window.GAS.log.w('[SPELL LISTS PLUGIN] Could not find list element in dialog');
      return;
    }
    
    // Add our spell lists option as a list item matching the D&D 5e style
    // Match the exact structure of other items: use dnd5e-icon custom element
    const spellListsOption = `
      <li data-tooltip="Configure which spell lists this custom class/subclass has access to.">
        <label>
          <dnd5e-icon src="systems/dnd5e/icons/svg/items/spell.svg"></dnd5e-icon>
          <span>Spell Lists</span>
          <input type="radio" name="type" value="SpellLists" required="">
        </label>
      </li>
    `;
    
    list.append(spellListsOption);
    
    window.GAS.log.i('[SPELL LISTS PLUGIN] Spell Lists option added successfully');

    // Intercept the dialog submit to handle our custom type
    const originalSubmit = app.data.buttons.ok.callback;
    app.data.buttons.ok.callback = async function(htmlArg) {
      // Store the original html argument (might be jQuery or raw DOM)
      const originalHtml = htmlArg;
      
      // Wrap in jQuery for our use
      const html = htmlArg instanceof jQuery ? htmlArg : $(htmlArg);
      
      const selectedType = html.find('input[name="type"]:checked').val();
      window.GAS.log.i('[SPELL LISTS PLUGIN] Selected type:', selectedType);
      
      if (selectedType === 'SpellLists') {
        window.GAS.log.i('[SPELL LISTS PLUGIN] Opening spell lists dialog for item:', item.name);
        await SpellListsPlugin._showSpellListsDialog(item);
        return null; // Prevent default behavior
      } else if (originalSubmit) {
        // Pass the original html argument to the D&D 5e callback (don't pass jQuery-wrapped version)
        return originalSubmit.call(this, originalHtml);
      }
    };
  }

  /**
   * Show dialog for configuring spell lists
   * @param {Item} item - The class or subclass item
   */
  static async _showSpellListsDialog(item) {
    // Core D&D 5e spell list classes
    const spellListClasses = [
      'Artificer',
      'Bard',
      'Cleric',
      'Druid',
      'Paladin',
      'Ranger',
      'Sorcerer',
      'Warlock',
      'Wizard'
    ];

    const currentLists = this.getSpellListsData(item);
    const currentLevel = currentLists?.level || 1;
    const selectedLists = currentLists?.lists || [];
    
    window.GAS.log.d('[SPELL LISTS PLUGIN] Current spell lists for', item.name, ':', selectedLists, 'at level', currentLevel);

    const content = `
      <form class="gas-spell-lists-form">
        <div class="form-group">
          <label>Level</label>
          <select name="level">
            ${Array.from({ length: 20 }, (_, i) => i + 1).map(level =>
              `<option value="${level}" ${currentLevel === level ? 'selected' : ''}>${level}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label><strong>Select Spell Lists</strong></label>
          <p class="notes" style="font-size: 0.9em; margin-bottom: 1em;">
            Check all spell lists this ${item.type} should have access to. 
            This is only needed for custom/homebrew classes.
          </p>
          <div class="spell-list-checkboxes" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5em;">
            ${spellListClasses.map(className => `
              <div style="display: flex; align-items: center;">
                <input type="checkbox" 
                       name="spell-list" 
                       value="${className}" 
                       id="spell-list-${className}"
                       ${selectedLists.includes(className) ? 'checked' : ''}
                       style="margin-right: 0.5em;">
                <label for="spell-list-${className}" style="margin: 0;">${className}</label>
              </div>
            `).join('')}
          </div>
        </div>
      </form>
    `;

    return new Dialog({
      title: `Configure Spell Lists for ${item.name}`,
      content,
      buttons: {
        submit: {
          icon: '<i class="fas fa-check"></i>',
          label: "Save",
          callback: async (html) => {
            const level = Number(html.find('[name="level"]').val());
            const selectedLists = [];
            html.find('input[name="spell-list"]:checked').each((i, el) => {
              selectedLists.push($(el).val());
            });
            
            window.GAS.log.d('[SPELL LISTS PLUGIN] Saving spell lists for', item.name, ':', selectedLists, 'at level', level);
            await this.setSpellListsData(item, { level, lists: selectedLists });
            
            ui.notifications.info(`Spell lists configured for ${item.name} at level ${level}: ${selectedLists.join(', ') || 'None'}`);
            
            // Re-render the item sheet to show the indicator
            const sheet = item.sheet;
            if (sheet && sheet.rendered) {
              window.GAS.log.d('[SPELL LISTS PLUGIN] Re-rendering item sheet');
              sheet.render(false);
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "submit",
      close: () => {
        window.GAS.log.d('[SPELL LISTS PLUGIN] Dialog closed');
      }
    }).render(true);
  }

  /**
   * Handle rendering the item sheet
   * Shows the configured spell lists in the advancement tab at the configured level
   */
  static _onRenderItemSheet5e(app, html, data) {
    window.GAS.log.i('[SPELL LISTS PLUGIN] _onRenderItemSheet5e called');
    
    // Foundry v12 vs v13+ compatibility: In v12 html is already jQuery, in v13+ it's a raw element
    html = html instanceof jQuery ? html : $(html);
    
    window.GAS.log.i('[SPELL LISTS PLUGIN] Item:', app.item?.name, 'Type:', app.item?.type);
    
    // Only proceed if this is a class or subclass item
    const item = app.item;
    if (!item || (item.type !== 'class' && item.type !== 'subclass')) {
      window.GAS.log.d('[SPELL LISTS PLUGIN] Skipping - not a class or subclass');
      return;
    }

    // Add click listener to advancement tab
    html.find('a.item[data-tab="advancement"]').on('click', () => {
      window.GAS.log.d('[SPELL LISTS PLUGIN] Advancement tab clicked, re-rendering');
      // Small delay to ensure tab is active when we re-render
      setTimeout(() => app.render(false), 0);
    });

    // Only proceed with rendering if advancement tab is active
    const advancementTabActive = html.find('.tab.advancement.active').length > 0;
    window.GAS.log.i('[SPELL LISTS PLUGIN] Advancement tab active:', advancementTabActive);
    
    if (!advancementTabActive) return;

    const spellListsData = this.getSpellListsData(item);
    window.GAS.log.i('[SPELL LISTS PLUGIN] Spell lists data:', spellListsData);
    
    if (!spellListsData || !spellListsData.lists || spellListsData.lists.length === 0) {
      window.GAS.log.d('[SPELL LISTS PLUGIN] No spell lists configured');
      return;
    }

    window.GAS.log.i('[SPELL LISTS PLUGIN] Rendering spell lists indicator for', item.name, 'at level', spellListsData.level);

    // Find the level section (v5 uses div.items-section with data-level)
    let levelSection = html.find(`div.items-section[data-level="${spellListsData.level}"]`);
    
    if (!levelSection.length) {
      window.GAS.log.w('[SPELL LISTS PLUGIN] Level section for level', spellListsData.level, 'does not exist, creating it');
      
      // Find the advancement tab content area
      const advancementTab = html.find('.tab.advancement');
      if (!advancementTab.length) {
        window.GAS.log.e('[SPELL LISTS PLUGIN] Could not find advancement tab');
        return;
      }
      
      window.GAS.log.d('[SPELL LISTS PLUGIN] Found advancement tab, looking for container');
      
      // Try different selectors for the container
      let advancementContainer = advancementTab.find('.advancement-list');
      if (!advancementContainer.length) {
        advancementContainer = advancementTab.find('.items-header').parent();
      }
      if (!advancementContainer.length) {
        advancementContainer = advancementTab;
      }
      
      window.GAS.log.d('[SPELL LISTS PLUGIN] Using container:', advancementContainer);
      
      // Create the level section
      const levelSectionHtml = `
        <div class="items-section card" data-level="${spellListsData.level}">
          <div class="items-header header">
            <h3 class="item-name">Level ${spellListsData.level}</h3>
            <div class="item-header advancement-value">Value</div>
            <div class="item-header item-controls"></div>
          </div>
          <ol class="item-list unlist"></ol>
        </div>
      `;
      
      // Find the right place to insert it (sorted by level)
      const allLevelSections = html.find('.advancement .items-section[data-level]');
      let inserted = false;
      
      allLevelSections.each((i, section) => {
        const sectionLevel = parseInt($(section).attr('data-level'));
        if (sectionLevel > spellListsData.level) {
          $(section).before(levelSectionHtml);
          inserted = true;
          return false; // break
        }
      });
      
      if (!inserted) {
        // Append at the end if it's the highest level
        advancementContainer.append(levelSectionHtml);
      }
      
      // Re-query the level section we just created
      levelSection = html.find(`div.items-section[data-level="${spellListsData.level}"]`);
      window.GAS.log.i('[SPELL LISTS PLUGIN] Created level section for level', spellListsData.level);
    }

    // Find the ol.item-list inside the level section
    const itemsList = levelSection.find('ol.item-list');
    if (!itemsList.length) {
      window.GAS.log.w('[SPELL LISTS PLUGIN] Could not find item list in level section');
      return;
    }

    window.GAS.log.d('[SPELL LISTS PLUGIN] Found item list, appending spell lists entry');

    // Create the spell lists advancement entry matching v5 structure
    const spellListsEntry = `
      <li class="advancement-item item" data-advancement-type="spell-lists">
        <div class="item-row">
          <div class="item-name">
            <img class="item-image gold-icon" src="systems/dnd5e/icons/svg/items/spell.svg">
            <div class="name">
              <div class="title">Spell Lists</div>
            </div>
            <div class="tags">
              <span class="tag">${spellListsData.lists.join(', ')}</span>
            </div>
          </div>
          
          <div class="item-detail advancement-value empty">
          </div>
          
          <div class="item-detail item-controls">
            <button type="button" class="unbutton control-button item-control item-action spell-lists-edit" data-tooltip="" aria-label="Edit Spell Lists">
              <i class="fas fa-pen-to-square" inert=""></i>
            </button>
            
            <button type="button" class="unbutton control-button item-control item-action spell-lists-delete" data-tooltip="" aria-label="Delete Spell Lists">
              <i class="fas fa-trash" inert=""></i>
            </button>
          </div>
        </div>
      </li>
    `;
    
    itemsList.append(spellListsEntry);

    // Add edit handler
    html.find('[data-advancement-type="spell-lists"] .spell-lists-edit').on('click', async (event) => {
      event.preventDefault();
      await this._showSpellListsDialog(item);
    });

    // Add delete handler
    html.find('[data-advancement-type="spell-lists"] .spell-lists-delete').on('click', async (event) => {
      event.preventDefault();
      const confirmed = await Dialog.confirm({
        title: "Delete Spell Lists",
        content: `<p>Are you sure you want to remove the spell lists configuration from ${item.name}?</p>`,
        defaultYes: false
      });
      
      if (confirmed) {
        await item.unsetFlag(MODULE_ID, 'spellLists');
        ui.notifications.info(`Spell lists removed from ${item.name}`);
        app.render(false);
      }
    });
  }

  /**
   * Get the configured spell lists data for an item
   * @param {Item} item - The class or subclass item
   * @returns {{level: number, lists: string[]}|null} - Spell lists data or null
   */
  static getSpellListsData(item) {
    return item.getFlag(MODULE_ID, 'spellLists');
  }

  /**
   * Set the spell lists data for an item
   * @param {Item} item - The class or subclass item
   * @param {{level: number, lists: string[]}} data - Spell lists data
   */
  static async setSpellListsData(item, data) {
    if (!data || !data.lists || data.lists.length === 0) {
      // Remove the flag if no lists are selected
      await item.unsetFlag(MODULE_ID, 'spellLists');
    } else {
      await item.setFlag(MODULE_ID, 'spellLists', data);
    }
  }
  
  /**
   * Get the configured spell lists for an item (backward compatibility)
   * @param {Item} item - The class or subclass item
   * @returns {string[]|null} - Array of spell list class names, or null if not configured
   */
  static getSpellLists(item) {
    const data = this.getSpellListsData(item);
    return data?.lists || null;
  }
}
