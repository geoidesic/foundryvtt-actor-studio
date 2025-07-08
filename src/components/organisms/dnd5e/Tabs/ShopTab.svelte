<script>
  import { shopItems, shopCart, availableGold, cartTotalCost, remainingGold, updateCart, loadShopItems, finalizePurchase, initializeGold } from '../../../../stores/equipmentShop';
  import { actorInGame, readOnlyTabs } from '../../../../stores/index';
  import GoldDisplay from '../../../molecules/GoldDisplay.svelte';
  import { PurchaseHandler } from '../../../../plugins/equipment-purchase/handlers/PurchaseHandler';
  import { onMount, tick } from 'svelte';
  import { localize } from "@typhonjs-fvtt/runtime/util/i18n";
  import { get } from 'svelte/store';

  let availableCurrency = { gp: 0, sp: 0, cp: 0 };
  let cartCurrency = { gp: 0, sp: 0, cp: 0 };
  let remainingCurrency = { gp: 0, sp: 0, cp: 0 };
  let loading = true;
  let cartItems = [];
  let keywordFilter = ''; // Add variable for keyword filter
  let expandedCategories = {}; // Track which categories are expanded

  $: isDisabled = $readOnlyTabs.includes('shop');

  // Fetch items when component mounts
  onMount(async () => {
    loading = true;
    
    // Initialize gold first to make sure it's available
    initializeGold();
    
    // Then load shop items
    await loadShopItems();
    
    loading = false;
  });

  // Reactive updates for currency display
  $: availableCurrency = PurchaseHandler.formatCurrency($availableGold);
  $: cartCurrency = PurchaseHandler.formatCurrency($cartTotalCost);
  $: remainingCurrency = PurchaseHandler.formatCurrency($remainingGold);

  // Update cart items whenever shopCart changes (shopItems no longer needed here)
  $: {
    if ($shopCart) {
      cartItems = Array.from($shopCart.entries()).map(([itemId, { quantity, itemData }]) => {
        if (itemData) {
          return {
            id: itemId,
            item: itemData,
            quantity,
            price: {
              value: itemData.system?.price?.value || 0,
              denomination: itemData.system?.price?.denomination || 'cp'
            }
          };
        }
        return null;
      }).filter(item => item !== null);
    }
  }

  // Helper function to get item display name with quantity
  function getItemDisplayName(item) {
    return item.name;
  }

  // Add item to cart
  async function addToCart(item) {
    try {
      const itemId = item.id || item._id;
      
      if (!itemId) {
        console.error("Item has no id:", item);
        ui.notifications?.warn(localize('GAS.Shop.ErrorItemNoId'));
        return;
      }

      const fullItemData = await fromUuid(item.uuid);
      if (!fullItemData) {
        console.error("Could not load full item data for UUID:", item.uuid);
        ui.notifications?.warn(localize('GAS.Shop.ErrorLoadingItem'));
        return;
      }
      
      const cart = get(shopCart);
      const currentQuantity = cart.has(itemId) ? cart.get(itemId).quantity : 0;
      const bundleQuantity = fullItemData.system?.quantity || 1;
      const newQuantity = currentQuantity + bundleQuantity;
      
      // Store the UUID separately for container handling
      updateCart(itemId, newQuantity, fullItemData, item.uuid);
      
    } catch(error) {
      console.error("Error adding item to cart:", error);
      ui.notifications?.warn(localize('GAS.Shop.ErrorAddToCart'));
    }
  }
  
  // Update item quantity in cart
  function updateItemQuantity(itemId, newQuantity) {
    try {
      const cart = get(shopCart);
      if (!cart.has(itemId)) return;

      const { itemData } = cart.get(itemId);
      const quantity = Math.max(0, newQuantity);
      
      updateCart(itemId, quantity, itemData);
    } catch(error) {
      console.error("Error updating item quantity:", error);
      ui.notifications?.warn(localize('GAS.Shop.ErrorUpdateQuantity'));
    }
  }
  
  // Remove item from cart completely
  function removeFromCart(itemId) {
    try {
      updateCart(itemId, 0, null);
    } catch(error) {
      console.error("Error removing item from cart:", error);
      ui.notifications?.warn(localize('GAS.Shop.ErrorRemoveFromCart'));
    }
  }

  // Filter and group items by category, applying keyword filter first
  $: filteredItems = $shopItems.filter(item => 
    item.name.toLowerCase().includes(keywordFilter.toLowerCase())
  );

  $: categoryGroups = filteredItems.reduce((acc, item) => {
    const category = item.type.charAt(0).toUpperCase() + item.type.slice(1) + 's';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Sort categories for consistent display order
  $: categories = Object.keys(categoryGroups).sort();

  // Toggle category expansion
  function toggleCategory(category) {
    expandedCategories[category] = !expandedCategories[category];
    expandedCategories = { ...expandedCategories }; // Trigger reactivity
  }
</script>

<div class="shop-tab-container" class:disabled={isDisabled}>
  <div class="shop-tab">
    <!-- Left Panel: Cart Items and Gold Info -->
    <div class="left-panel">
      <h3 class="left no-margin">{localize('GAS.Shop.AvailableGold')}</h3>
      <div class:negative={$remainingGold < 0} class="remaining-currency">
        <GoldDisplay {...remainingCurrency} />
      </div>
      <h3 class="left no-margin">{localize('GAS.Shop.SpentGold')}</h3>
      <GoldDisplay {...cartCurrency} />

      <h3>{localize('GAS.Shop.CartItems')}</h3>
      <div class="cart-items">
        {#if cartItems.length === 0}
          <div class="empty-cart">
            <p>{localize('GAS.Shop.CartEmpty')}</p>
          </div>
        {:else}
          {#each cartItems as cartItem}
            <div class="cart-item">
              <div class="cart-item-col1">
                <img src={cartItem.item.img} alt={cartItem.item.name} class="item-icon" />
              </div>
              <div class="cart-item-col2 left">
                <div class="cart-item-name">{getItemDisplayName(cartItem.item)}</div>
                <div class="cart-item-subdetails">
                  <span class="cart-item-price">{cartItem.price.value} {cartItem.price.denomination}</span>
                  <span class="quantity-display">×{cartItem.quantity}</span>
                </div>
              </div>
              <div class="cart-item-col3">
                <button class="remove-btn" on:click={() => removeFromCart(cartItem.id)} disabled={isDisabled}>
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Right Panel: Available Equipment -->
    <div class="right-panel item-list">
      <h3>{localize('GAS.Shop.AvailableEquipment')}</h3>
      
      <!-- Add Keyword Filter Input -->
      <div class="filter-container mb-sm">
        <input 
          type="text" 
          bind:value={keywordFilter} 
          placeholder={localize('GAS.Shop.FilterPlaceholder')} 
          class="keyword-filter"
          disabled={isDisabled}
        />
      </div>

      {#if loading}
        <div class="loading">{localize('GAS.Shop.Loading')}</div>
      {:else if filteredItems.length === 0} <!-- Check filteredItems length -->
        <div class="empty-state">
          <p>{keywordFilter ? localize('GAS.Shop.NoMatchingEquipment') : localize('GAS.Shop.NoEquipment')}</p> <!-- Adjust message based on filter -->
        </div>
      {:else}
        {#each categories as category}
          <div class="category">
            <h4 class="left mt-sm flexrow category-header pointer" on:click={() => toggleCategory(category)}>
              <div class="flex0 mr-xs">
                {#if expandedCategories[category]}
                  <span>[-]</span>
                {:else}
                  <span>[+]</span>
                {/if}
              </div>
              <div class="flex">{category}</div>
            </h4>
            {#if expandedCategories[category]}
              <!-- Use categoryGroups which is derived from filteredItems -->
              {#each categoryGroups[category] as item (item.uuid || item._id)} 
                <div class="item-row">
                  <div class="item-details">
                    <img src={item.img} alt={item.name} class="item-icon" />
                    <span class="item-name">{getItemDisplayName(item)}</span>
                  </div>
                  <div class="item-actions">
                    <span class="item-price">
                      {item.system?.price?.value || 0} {item.system?.price?.denomination || 'cp'}
                    </span>
                    <button class="add-btn" on:click|preventDefault={() => addToCart(item)} disabled={isDisabled}>
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
  {#if isDisabled}
    <div class="overlay"></div>
  {/if}
</div>

<style lang="sass">
  @import "../../../../../styles/features/equipment-purchase.sass"

  .shop-tab-container 
    position: relative
    height: 100%
    width: 100%

    &.disabled 
      pointer-events: none
    
  .overlay
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-color: rgba(200, 200, 200, 0.3)
    pointer-events: all
    cursor: not-allowed
    z-index: 100
    transition: background-color 0.2s ease
    &:hover
      background-color: rgba(200, 200, 200, 0.4)

  .shop-tab
    display: flex
    height: 100%
    overflow: hidden

  .left-panel
    flex: 1
    display: flex
    flex-direction: column
    height: 100%
    overflow-y: auto
    padding: 0.5rem
    border-right: 1px solid var(--color-border-light-tertiary)

  .right-panel
    flex: 2
    display: flex
    flex-direction: column
    height: 100%
    overflow-y: auto
    padding: 0.5rem

  h3
    margin-bottom: 0.5rem
    border-bottom: 1px solid var(--color-border-light-highlight)
    padding-bottom: 0.25rem

  .loading, .empty-state, .empty-cart
    padding: 1rem
    text-align: center
    color: var(--color-text-dark-secondary)

  .remaining-currency
    &.negative
      :global(.currency-display)
        background-color: rgba(255, 0, 0, 0.1)
        border-color: rgba(255, 0, 0, 0.5)

  .cart-items
    flex: 1
    overflow-y: auto
    margin-bottom: 1rem
    display: flex
    flex-direction: column
    gap: 0.5rem

  .cart-item
    display: flex
    padding-right: 0.5rem
    background: rgba(0, 0, 0, 0.05)
    border: 1px solid var(--color-border-light-tertiary)
    border-radius: 3px
    align-items: stretch
    gap: 0.75rem

    .cart-item-col1
      width: 100%
      height: 100%
      max-width: 50px
    .item-icon
      height: 100%
      object-fit: contain
      border: none
      display: block

    .cart-item-col2
      flex: 1
      display: flex
      flex-direction: column
      gap: 0.1rem
      min-width: 0
      padding-top: 0.5rem
      padding-bottom: 0.5rem
      justify-content: center

    .cart-item-name
      font-weight: bold
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis
      line-height: 1.2

    .cart-item-subdetails
      display: flex
      align-items: center
      gap: 0.5rem
      font-size: 0.9em
      color: var(--color-text-dark-secondary)
      line-height: 1.1

    .cart-item-price
      white-space: nowrap

    .quantity-display
      background: rgba(0, 0, 0, 0.1)
      padding: 0.1rem 0.3rem
      border-radius: 3px
      font-weight: bold
      min-width: 1.8rem
      text-align: center
      white-space: nowrap
      font-size: 0.9em
      color: var(--color-text-dark-primary)

    .cart-item-col3
      flex-shrink: 0
      display: flex
      align-items: center
      padding-top: 0.5rem
      padding-bottom: 0.5rem

    .remove-btn
      background: none
      border: none
      color: #990000
      cursor: pointer
      padding: 0.25rem
      border-radius: 3px
      line-height: 1
      
      &:hover
        background: rgba(153, 0, 0, 0.1)

      &:disabled
        opacity: 0.5
        cursor: not-allowed
        &:hover
          background: none

  .category
    h4
      color: var(--color-highlight)
      font-size: 1rem
      margin-bottom: 0.2rem
      padding-bottom: 0.1rem
      border-bottom: 1px solid var(--color-border-light-highlight)
      cursor: pointer

  .item-row
    display: flex
    justify-content: space-between
    padding: 0.25rem
    align-items: center
    border-bottom: 1px solid rgba(0, 0, 0, 0.05)

    &:hover
      background: rgba(0, 0, 0, 0.05)

  .item-details
    display: flex
    align-items: center
    gap: 0.5rem
    flex: 1

    .item-icon
      width: 24px
      height: 24px
      border: none

  .item-actions
    display: flex
    align-items: center
    gap: 0.5rem
    min-width: 80px
    justify-content: flex-end

    .item-price
      color: var(--color-text-dark-secondary)
      font-size: 0.9rem

    .add-btn
      background: var(--dnd5e-color-gold, #b59e54)
      border: none
      width: 24px
      height: 24px
      border-radius: 3px
      color: black
      display: flex
      align-items: center
      justify-content: center
      cursor: pointer

      i.fas.fa-plus
        margin-right: 0
        margin-left: 0

      &:hover
        background: darken(#b59e54, 10%)

      &:disabled
        opacity: 0.5
        cursor: not-allowed
        &:hover
          background: var(--dnd5e-color-gold, #b59e54)
          
  .filter-container
    padding: 0 0.25rem // Match item-row padding
    margin-bottom: 0.5rem // Add margin like h4

  .keyword-filter
    width: 100%
    padding: 0.3rem 0.5rem
    border: 1px solid var(--color-border-light-tertiary)
    border-radius: 3px
    background: rgba(0, 0, 0, 0.05)
    color: var(--color-text-dark-primary)

    &:focus
      outline: none
      border-color: var(--color-border-light-highlight)
      background: rgba(0, 0, 0, 0.08)

    &:disabled
      opacity: 0.7
      cursor: not-allowed
      background: rgba(0, 0, 0, 0.02)

  .toggle-icon
    margin-left: 0.5rem
    font-size: 0.8rem
    color: var(--color-text-dark-secondary)
</style>