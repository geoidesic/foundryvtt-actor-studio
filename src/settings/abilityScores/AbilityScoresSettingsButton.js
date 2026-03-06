import AbilityScoresSettingsApp from './AbilityScoresSettingsApp.js';

export default class AbilityScoresSettingsButton extends FormApplication {
  static showSettings() {
    const app = new AbilityScoresSettingsApp();
    app.render(true, { focus: true });
    return app;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    AbilityScoresSettingsButton.showSettings();
  }

  async _updateObject(event, formData) {}
  render() {
    this.close();
  }
}
