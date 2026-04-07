import SpellSettingsApp from './SpellSettingsApp.js';

export default class SpellSettingsButton extends FormApplication {
  static showSettings() {
    const app = new SpellSettingsApp();
    app.render(true, { focus: true });
    return app;
  }

  constructor(options = {}) {
    super({}, options);
    SpellSettingsButton.showSettings();
  }

  async _updateObject(event, formData) {}

  render() {
    this.close();
  }
}
