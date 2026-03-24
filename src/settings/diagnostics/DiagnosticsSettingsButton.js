import DiagnosticsSettingsApp from './DiagnosticsSettingsApp.js';

export default class DiagnosticsSettingsButton extends FormApplication {
  static #diagnosticsSettingsApp;

  static showSettings() {
    this.#diagnosticsSettingsApp = this.#diagnosticsSettingsApp ? this.#diagnosticsSettingsApp : new DiagnosticsSettingsApp();
    this.#diagnosticsSettingsApp.render(true, { focus: true });
    return this.#diagnosticsSettingsApp;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    DiagnosticsSettingsButton.showSettings();
  }

  async _updateObject(event, formData) {}
  render() { this.close(); }
}
