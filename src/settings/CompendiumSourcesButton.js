import CompendiumSourcesApp from './CompendiumSourcesApp.js';

export default class CompendiumSourcesButton extends FormApplication {
  static showSettings() {
    const sourcesApp = new CompendiumSourcesApp();
    sourcesApp.render(true, { focus: true });

    return sourcesApp;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    CompendiumSourcesButton.showSettings();
  }

  async _updateObject(event, formData) {}
  render() {
    this.close();
  }
}
