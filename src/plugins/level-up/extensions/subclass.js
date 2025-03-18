// console.log('[LEVEL UP] subclass extension constructor file loaded', CONFIG.DND5E.advancementTypes);

export default class LevelUpSubclassExtension extends CONFIG.DND5E.advancementTypes.Subclass.documentClass {
  constructor() {
    super();
    window.GAS.log.d('[LEVEL UP] subclass extension constructor');
  }

  // Disable the compendium browsing but maintain other functionality
  async _onBrowseCompendium(event) {
    window.GAS.log.d('[LEVEL UP] subclass compendium browsing intercepted');
    event.preventDefault();
    
    // Display a notification explaining why this is disabled
    ui.notifications.info("Subclass selection is handled through the Actor Studio interface.");
  }

  // Disable drop functionality but maintain other advancement behavior
  async _onDrop(event) {
    window.GAS.log.d('[LEVEL UP] subclass drop intercepted');
    event.preventDefault();
    
    // Display a notification explaining why this is disabled
    ui.notifications.info("Subclass selection is handled through the Actor Studio interface.");
  }
  
  // Override to ensure the advancement is properly displayed in the advancements list
  async render(options={}) {
    // Call the parent class's render method to ensure the advancement renders properly
    return super.render(options);
  }
}
