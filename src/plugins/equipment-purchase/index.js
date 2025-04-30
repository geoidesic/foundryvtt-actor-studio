// Initialize the Equipment Purchase feature
import { MODULE_ID } from '~/src/helpers/constants';

export const initEquipmentPurchase = () => {
  // Register the equipmentPurchase feature in the global window.GAS object
  if (!window.GAS) window.GAS = {};
  
  // Create helper function for adding Shop tab
  window.GAS.registerShopTab = (tabs, activeTab) => {
    // Only add if not already present
    if (!tabs.find(x => x.id === "shop")) {
      window.GAS.log.d('[EQUIPMENT-PURCHASE] Adding shop tab');
      // Use component name only - the tab system will look for it in ~/src/components/organisms/dnd5e/Tabs/
      tabs.update(t => [...t, { label: "Shop", id: "shop", component: "ShopTab" }]);
      activeTab.set("shop");
    }
  };
  
  // Initialize equipment shop main store
  window.GAS.initShopGold = (totalGold) => {
    if (window.GAS.availableGold) {
      window.GAS.availableGold.set(totalGold * 100); // Convert to copper
      window.GAS.log.d('[EQUIPMENT-PURCHASE] Initialized shop with gold:', totalGold);
    } else {
      window.GAS.log.e('[EQUIPMENT-PURCHASE] Failed to initialize shop gold - store not found');
    }
  };
};
