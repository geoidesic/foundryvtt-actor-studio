import SpellListManagerApp from './SpellListManagerApp.js';

export default class SpellListManagerButton extends FormApplication {
  static showManager() {
    const app = new SpellListManagerApp();
    app.render(true, { focus: true });
    return app;
  }

  /**
   * @inheritDoc
   */
  constructor(options = {}) {
    super({}, options);
    SpellListManagerButton.showManager();
  }

  async _updateObject(event, formData) {}
  render() {
    this.close();
  }
}