import { DEFAULT_SOURCES, LOG_PREFIX, MODULE_ID } from '../helpers/constants';

export default class CompendiumSourcesSubmenu extends FormApplication {
  constructor() {
    super({});
    this.baseCompendiumList = game.packs.filter((p) => p.documentName === 'Item');
  }

  baseCompendiumList: any;

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      width: 400,
      height: 400,
      template: `/modules/foundryvtt-actor-studio/templates/sources-submenu.html`,
      id: 'gas-settings-submenu',
      title: 'Actor Studio - Sources',
      resizable: false,
    });
  }

  activateListeners(html: JQuery) {
    super.activateListeners(html);
  }

  getData() {
    let selected: any = game.settings.get(MODULE_ID, 'compendiumSources');
    //@ts-expect-error Foundry.utils TS def not updated yet
    if (foundry.utils.isEmpty(selected)) {
      selected = DEFAULT_SOURCES;
    }
    const data = buildTemplateData({
      compendiaList: this.baseCompendiumList,
      selectedCompendia: selected,
    });
    return data as any;
  }

  _updateObject(event: Event, formData?: any) {
    console.info(`${LOG_PREFIX} | Saving compendia sources:`);
    console.info(formData);
    return game.settings.set(MODULE_ID, 'compendiumSources', formData);
  }

  protected _getSubmitData(updateData?: any | null | undefined): Record<string, unknown> {
    if (!this.form) throw new Error('The FormApplication subclass has no registered form element');
    const fd = new FormDataExtended(this.form as HTMLFormElement, { editors: this.editors });
    const data = (fd as any).object;
    Object.keys(data).forEach((k) => (data[k] = []));
    this.form.querySelectorAll('[type="checkbox"]:checked').forEach((el: any) => {
      if (!Array.isArray(data[el.name]) || typeof data[el.name][0] === 'boolean') data[el.name] = [];
      data[el.name].push(el.value);
    });
    return data;
  }
}

function buildCompendiaList(compendiaList: Compendium[], defaultCollection: DefaultCollection, defaultType: keyof DefaultCollection) {
  return compendiaList
    .filter((p: any) => {
      return p.metadata.packageName !== 'dnd5e' || p.metadata.id === `dnd5e.${defaultType}`
    })
    .map((p: any) => {
      return {
        collection: p.collection as string,
        label: `${p.metadata.label} [${p.metadata.packageName}]`,
        checked: defaultCollection[defaultType]?.includes(p.collection),
      };
    });
}

type BuildData = {
  compendiaList: any[];
  selectedCompendia: {
    races: string[];
    classes: string[];
    subclasses: string[];
    backgrounds: string[];
    // racialFeatures: string[];
    // classFeatures: string[];
    // spells: string[];
    // feats: string[];
    // items: string[];
  };
};

type Compendium = {
  collection: string;
  metadata: {
    packageName: string;
    label: string;
  };
};

type DefaultCollection = {
  races: string[];
  racialFeatures: string[];
  classes: string[];
  subclasses: string[];
  backgrounds: string[];
  spells: string[];
  feats: string[];
  items: string[];
};

function buildTemplateData({ compendiaList, selectedCompendia }: BuildData) {
  return {
    source: {
      races: {
        label: game.i18n.localize('GAS.Setting.Sources.RaceCompendia'),
        compendia: buildCompendiaList(compendiaList, selectedCompendia, 'races'),
      },
      racialFeatures: {
        label: game.i18n.localize('GAS.Setting.Sources.RacialFeatureCompendia'),
        compendia: buildCompendiaList(compendiaList, selectedCompendia, 'racialFeatures'),
      },
      classes: {
        label: game.i18n.localize('GAS.Setting.Sources.ClassCompendia'),
        compendia: buildCompendiaList(compendiaList, selectedCompendia, 'classes'),
      },
      subclasses: {
        label: game.i18n.localize('GAS.Setting.Sources.SubclassCompendia'),
        compendia: buildCompendiaList(compendiaList, selectedCompendia, 'subclasses'),
      },
      // classFeatures: {
      //   label: game.i18n.localize('GAS.Setting.Sources.ClassFeatureCompendia'),
      //   compendia: buildCompendiaList(compendiaList, selectedCompendia, 'classFeatures'),
      // },
      backgrounds: {
        label: game.i18n.localize('GAS.Setting.Sources.BackgroundCompendia'),
        compendia: buildCompendiaList(compendiaList, selectedCompendia, 'backgrounds'),
      },
      spells: {
        label: game.i18n.localize('GAS.Setting.Sources.SpellCompendia'),
        compendia: buildCompendiaList(compendiaList, selectedCompendia, 'spells'),
      },
      feats: {
        label: game.i18n.localize('GAS.Setting.Sources.FeatCompendia'),
        compendia: buildCompendiaList(compendiaList, selectedCompendia, 'feats'),
      },
      items: {
        label: game.i18n.localize('GAS.Setting.Sources.EquipmentCompendia'),
        compendia: buildCompendiaList(compendiaList, selectedCompendia, 'items'),
      },
    },
  };
}
