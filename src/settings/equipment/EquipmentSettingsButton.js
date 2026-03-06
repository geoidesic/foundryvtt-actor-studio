import EquipmentSettingsApp from './EquipmentSettingsApp.js';

export default class EquipmentSettingsButton extends FormApplication {
  static showSettings() {
    const app = new EquipmentSettingsApp();
    app.render(true, { focus: true });
    return app;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    EquipmentSettingsButton.showSettings();
  }

  async _updateObject(event, formData) {}
  render() {
    this.close();
  }
}
