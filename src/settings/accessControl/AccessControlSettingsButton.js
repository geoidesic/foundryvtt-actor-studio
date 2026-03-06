import AccessControlSettingsApp from './AccessControlSettingsApp.js';

export default class AccessControlSettingsButton extends FormApplication {
  static showSettings() {
    const app = new AccessControlSettingsApp();
    app.render(true, { focus: true });
    return app;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    AccessControlSettingsButton.showSettings();
  }

  async _updateObject(event, formData) {}
  render() {
    this.close();
  }
}
