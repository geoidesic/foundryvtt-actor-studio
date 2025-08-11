import { DEFAULT_SOURCES, LOG_PREFIX, MODULE_ID } from '../helpers/constants';

export default class CompendiumSourcesSubmenu extends FormApplication {
  constructor() {
    super({});
    this.baseCompendiumList = game.packs.filter((p) => p.documentName === 'Item' || p.documentName === 'Actor');
    this.filterPackSourcesAppropriatelyByName = game.settings.get(MODULE_ID, 'filterPackSourcesAppropriatelyByName');
    this.npcEnabled = game.settings.get(MODULE_ID, 'enableNPCCreation');
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      width: 420,
      height: 600,

      template: `/modules/foundryvtt-actor-studio/templates/sources-submenu.html`,
      id: 'gas-settings-submenu',
      title: 'Actor Studio - Sources',
      resizable: false,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  getData() {
    let selected = game.settings.get(MODULE_ID, 'compendiumSources');
    if (foundry.utils.isEmpty(selected)) {
      selected = DEFAULT_SOURCES;
    }
    const data = this.buildTemplateData({
      compendiaList: this.baseCompendiumList,
      selectedCompendia: selected,
    });
    return data;
  }

  _updateObject(event, formData) {
    console.info(`${LOG_PREFIX} | Saving compendia sources:`);
    console.info(formData);
    return game.settings.set(MODULE_ID, 'compendiumSources', formData);
  }

  _getSubmitData(updateData) {
    if (!this.form) throw new Error('The FormApplication subclass has no registered form element');
    const fd = new FormDataExtended(this.form, { editors: this.editors });
    const data = fd.object;
    Object.keys(data).forEach((k) => data[k] = []);
    this.form.querySelectorAll('[type="checkbox"]:checked').forEach((el) => {
      if (!Array.isArray(data[el.name]) || typeof data[el.name][0] === 'boolean') data[el.name] = [];
      data[el.name].push(el.value);
    });
    return data;
  }

  buildTemplateData({ compendiaList, selectedCompendia }) {
    const data = {
      source: {
        races: {
          label: game.i18n.localize('GAS.Setting.Sources.RaceCompendia'),
          compendia: this.buildCompendiaList(compendiaList, selectedCompendia, 'races', ['race'])
        },
        classes: {
          label: game.i18n.localize('GAS.Setting.Sources.ClassCompendia'),
          compendia: this.buildCompendiaList(compendiaList, selectedCompendia, 'classes', ['class'], ['subclass'])
        },
        subclasses: {
          label: game.i18n.localize('GAS.Setting.Sources.SubclassCompendia'),
          compendia: this.buildCompendiaList(compendiaList, selectedCompendia, 'subclasses', ['subclass'])
        },
        backgrounds: {
          label: game.i18n.localize('GAS.Setting.Sources.BackgroundCompendia'),
          compendia: this.buildCompendiaList(compendiaList, selectedCompendia, 'backgrounds', ['background'])
        },
        equipment: {
          label: game.i18n.localize('GAS.Setting.Sources.EquipmentCompendia'),
          compendia: this.buildCompendiaList(compendiaList, selectedCompendia, 'equipment', ['item', 'equipment'])
        },
        spells: {
          label: game.i18n.localize('GAS.Setting.Sources.SpellCompendia'),
          compendia: this.buildCompendiaList(compendiaList, selectedCompendia, 'spells', ['spell'])
        }
      }
    };
    if (this.npcEnabled) {
      data.source.npcs = {
        label: game.i18n.localize('GAS.Setting.Sources.NPCCompendia'),
        compendia: this.buildCompendiaList(compendiaList, selectedCompendia, 'npcs', ['npc'])
      };
    }
    return data;
  }

  /**
   * Builds a list of compendia based on the inclusions and storage key.
   * @param {Array} compendiaList - The list of compendia to filter.
   * @param {string} defaultCollection - The default collection to filter by.
   * @param {string} storageKey - The storage key to use for the filtered list.
   * @param {Array} inclusions - The list of terms to include when filtering.
   * @param {Array} exclusions - The list of exclusions to filter by.
   * @returns {Array} The filtered list of compendia.
   */
  buildCompendiaList(compendiaList, defaultCollection, storageKey, inclusions = [], exclusions = []) {
    window.GAS.log.d('buildCompendiaList input:', {
      compendiaListLength: compendiaList.length,
      defaultCollection,
      inclusions,
      storageKey,
      exclusions,
      filterEnabled: this.filterPackSourcesAppropriatelyByName
    });

    let filter = (pack) => {
      const hasMatch = inclusions.some(inclusion =>
        pack.metadata.id.toLowerCase().includes(inclusion.toLowerCase()) ||
        pack.metadata.name.toLowerCase().includes(inclusion.toLowerCase()) ||
        pack.metadata.path.toLowerCase().includes(inclusion.toLowerCase()) ||
        pack.metadata.label.toLowerCase().includes(inclusion.toLowerCase())
      );

      const hasExclusion = exclusions.some(exclusion => 
        pack.metadata.id.toLowerCase().includes(exclusion.toLowerCase()) ||
        pack.metadata.name.toLowerCase().includes(exclusion.toLowerCase()) ||
        pack.metadata.path.toLowerCase().includes(exclusion.toLowerCase()) ||
        pack.metadata.label.toLowerCase().includes(exclusion.toLowerCase())
      );

      window.GAS.log.d('Filtering pack:', {
        id: pack.metadata.id,
        name: pack.metadata.name,
        path: pack.metadata.path,
        label: pack.metadata.label,
        inclusions,
        hasMatch,
        hasExclusion,
        exclusions
      });

      return hasMatch && !hasExclusion;
    };

    const filteredCompendia = this.filterPackSourcesAppropriatelyByName ? compendiaList.filter(filter) : compendiaList;
    
    window.GAS.log.d('After filtering:', {
      originalLength: compendiaList.length,
      filteredLength: filteredCompendia.length,
      filtered: filteredCompendia.map(p => ({
        id: p.metadata.id,
        name: p.metadata.name
      }))
    });

    return filteredCompendia
      .map((p) => ({
        collection: p.collection,
        label: `${p.metadata.label} [${p.metadata.packageName}]`,
        checked: defaultCollection[storageKey]?.includes(p.collection),
      }));
  }
}
