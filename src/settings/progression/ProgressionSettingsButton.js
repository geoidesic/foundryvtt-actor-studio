import ProgressionSettingsApp from './ProgressionSettingsApp.js';

export default class ProgressionSettingsButton extends FormApplication {
  static showSettings() {
    const app = new ProgressionSettingsApp();
    app.render(true, { focus: true });
    return app;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    ProgressionSettingsButton.showSettings();
  }

  async _updateObject(event, formData) {}
  render() {
    this.close();
  }
}
