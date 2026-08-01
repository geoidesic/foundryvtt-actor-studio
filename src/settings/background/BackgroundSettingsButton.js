import BackgroundSettingsApp from './BackgroundSettingsApp.js';

export default class BackgroundSettingsButton extends FormApplication {
  static showSettings() {
    const app = new BackgroundSettingsApp();
    app.render(true, { focus: true });
    return app;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    BackgroundSettingsButton.showSettings();
  }

  async _updateObject(event, formData) {}

  render() {
    this.close();
  }
}