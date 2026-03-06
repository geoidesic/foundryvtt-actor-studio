import UISettingsApp from './UISettingsApp.js';

export default class UISettingsButton extends FormApplication {
  static showSettings() {
    const app = new UISettingsApp();
    app.render(true, { focus: true });
    return app;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    UISettingsButton.showSettings();
  }

  async _updateObject(event, formData) {}
  render() {
    this.close();
  }
}
