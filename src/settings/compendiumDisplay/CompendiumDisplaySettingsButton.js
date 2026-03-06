import CompendiumDisplaySettingsApp from './CompendiumDisplaySettingsApp.js';

export default class CompendiumDisplaySettingsButton extends FormApplication {
  static showSettings() {
    const app = new CompendiumDisplaySettingsApp();
    app.render(true, { focus: true });
    return app;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    CompendiumDisplaySettingsButton.showSettings();
  }

  async _updateObject(event, formData) {}
  render() {
    this.close();
  }
}
