import DonationTrackerSettingsApp   from './DonationTrackerSettingsApp.js';

export default class DonationTrackerSettingsButton extends FormApplication
{
   static #dtSettingsApp;

   static showSettings()
   {
      this.#dtSettingsApp = this.#dtSettingsApp ? this.#dtSettingsApp : new DonationTrackerSettingsApp();
      this.#dtSettingsApp.render(true, { focus: true });

      return this.#dtSettingsApp;
   }

   /**
    * @inheritDoc
    */
   constructor(options = {})
   {
      super({}, options);
      DonationTrackerSettingsButton.showSettings();
   }

   async _updateObject(event, formData) {}
   render() { this.close(); }
}