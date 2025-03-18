// console.log('[LEVEL UP] subclass extension constructor file loaded', CONFIG.DND5E.advancementTypes);

export default class SubclassAdvancement extends CONFIG.DND5E.advancementTypes.Subclass.documentClass {
  /**
   * @inheritDoc
   * Define the levels at which this advancement type is added to a class.
   * @type {number[]}
   */
  static get levels() {
    return CONFIG.DND5E.advancementTypes.Subclass.levels;
  }

  constructor() {
    super();
    window.GAS.log.d('[LEVEL UP] subclass extension constructor');
  }
}
