import { DEFAULT_SOURCES, LOG_PREFIX, MODULE_ID } from '../helpers/constants';
import { safeGetSetting } from '~/src/helpers/Utility';

export default class CompendiumSourcesSubmenu extends FormApplication {
  constructor() {
    super({});
    this.baseCompendiumList = game.packs.filter((p) => p.documentName === 'Item');
    this.filterPackSourcesAppropriatelyByName = safeGetSetting(MODULE_ID, 'filterPackSourcesAppropriatelyByName', false);
    this._searchText = '';
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['form', 'gas-sources-submenu'],
      popOut: true,
      width: 760,
      height: 700,
      minWidth: 560,
      minHeight: 500,

      template: `/modules/foundryvtt-actor-studio/templates/sources-submenu.html`,
      id: 'gas-settings-submenu',
      title: 'Actor Studio - Sources',
      resizable: true,
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('[data-action="search"]').on('input', this.#onSearchInput.bind(this));
    html.find('[data-action="expand-all"]').on('click', this.#onExpandAll.bind(this));
    html.find('[data-action="collapse-all"]').on('click', this.#onCollapseAll.bind(this));
    html.find('[data-action="select-visible"]').on('click', this.#onSelectVisible.bind(this));
    html.find('[data-action="clear-visible"]').on('click', this.#onClearVisible.bind(this));
    html.find('[data-action="reset-defaults"]').on('click', this.#onResetDefaults.bind(this));
    html.find('[data-action="cancel"]').on('click', this.#onCancel.bind(this));

    this.#applySearchFilter(html[0]);
  }

  getData() {
    let selected = safeGetSetting(MODULE_ID, 'compendiumSources', DEFAULT_SOURCES);
    if (foundry.utils.isEmpty(selected)) {
      selected = DEFAULT_SOURCES;
    }
    const data = this.buildTemplateData({
      compendiaList: this.baseCompendiumList,
      selectedCompendia: selected,
    });

    data.searchText = this._searchText;

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

  #onSearchInput(event) {
    this._searchText = (event.currentTarget?.value ?? '').toLowerCase().trim();
    this.#applySearchFilter(this.form);
  }

  #applySearchFilter(formElement) {
    if (!formElement) return;

    const searchText = this._searchText;
    const sections = Array.from(formElement.querySelectorAll('.gas-source-section'));

    for (const section of sections) {
      const rows = Array.from(section.querySelectorAll('.gas-source-row'));
      let visibleInSection = 0;

      for (const row of rows) {
        const searchable = row.dataset.searchable ?? '';
        const visible = !searchText || searchable.includes(searchText);
        row.classList.toggle('is-hidden', !visible);
        if (visible) visibleInSection += 1;
      }

      section.classList.toggle('is-hidden', visibleInSection === 0);
      if (searchText && visibleInSection > 0) {
        section.open = true;
      }
    }
  }

  #onExpandAll(event) {
    event.preventDefault();
    this.form?.querySelectorAll('.gas-source-section').forEach((el) => {
      el.open = true;
    });
  }

  #onCollapseAll(event) {
    event.preventDefault();
    this.form?.querySelectorAll('.gas-source-section').forEach((el) => {
      el.open = false;
    });
  }

  #forEachVisibleCheckbox(callback) {
    if (!this.form) return;
    this.form.querySelectorAll('.gas-source-row:not(.is-hidden) input[type="checkbox"]').forEach((checkbox) => {
      callback(checkbox);
    });
  }

  #onSelectVisible(event) {
    event.preventDefault();
    this.#forEachVisibleCheckbox((checkbox) => {
      checkbox.checked = true;
    });
  }

  #onClearVisible(event) {
    event.preventDefault();
    this.#forEachVisibleCheckbox((checkbox) => {
      checkbox.checked = false;
    });
  }

  #onResetDefaults(event) {
    event.preventDefault();
    if (!this.form) return;

    this.form.querySelectorAll('.gas-source-row input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
    });

    Object.entries(DEFAULT_SOURCES).forEach(([sourceKey, compendia]) => {
      if (!Array.isArray(compendia)) return;
      compendia.forEach((collection) => {
        const input = this.form.querySelector(`input[type="checkbox"][name="${sourceKey}"][value="${collection}"]`);
        if (input) input.checked = true;
      });
    });
  }

  #onCancel(event) {
    event.preventDefault();
    this.close();
  }

  buildTemplateData({ compendiaList, selectedCompendia }) {
    return {
      source: {
        races: {
          label: game.i18n.localize('GAS.Setting.Sources.RaceCompendia'),
          compendia: this.buildCompendiaList(compendiaList, selectedCompendia, 'races',['race'])
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
        },
        feats: {
          label: game.i18n.localize('GAS.Setting.Sources.FeatCompendia'),
          compendia: this.buildCompendiaList(compendiaList, selectedCompendia, 'feats', ['feat'])
        }
      }
    };
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
