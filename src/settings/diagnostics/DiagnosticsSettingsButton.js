import DiagnosticsSettingsApp from './DiagnosticsSettingsApp.js';

export default class DiagnosticsSettingsButton extends FormApplication {
  static showSettings() {
    const app = new DiagnosticsSettingsApp();
    app.render(true, { focus: true });
    return app;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    DiagnosticsSettingsButton.showSettings();
  }

  async _updateObject(event, formData) {}
  render() {
    this.close();
  }
}
