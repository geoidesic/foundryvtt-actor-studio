import CompendiumSourcesApp from './CompendiumSourcesApp.js';

export default class CompendiumSourcesButton extends FormApplication {
  static #sourcesApp;

  static showSettings() {
    this.#sourcesApp = this.#sourcesApp ? this.#sourcesApp : new CompendiumSourcesApp();
    this.#sourcesApp.render(true, { focus: true });

    return this.#sourcesApp;
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
