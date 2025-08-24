<script>
  import { onMount, onDestroy } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { activeTab, readOnlyTabs, npcCurrency, selectedNpcBase } from '~/src/stores/index';
  import { shopItems, shopCart, loadShopItems, updateCart } from '../../../../stores/equipmentShop';
  import StandardTabLayout from '~/src/components/organisms/StandardTabLayout.svelte';
  import NPCCoinageManager from '~/src/components/molecules/dnd5e/NPC/NPCCoinageManager.svelte';
  import { localize as t, enrichHTML } from "~/src/helpers/Utility";
  import { get } from 'svelte/store';

  // Get ui for notifications
  const ui = game?.ui;
  
  // Compatibility check for fromUuid (Foundry VTT v12 vs v13+)
  const fromUuid = foundry.utils?.fromUuid || globalThis.fromUuid;

  // Local state
  let cartItems = [];
  let keywordFilter = '';
  let expandedCategories = {};
  let loading = true;
  let editingCoinage = false;
  
  // NPC coinage management
  let npcCoinage = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };

  $: isDisabled = $readOnlyTabs.includes('npc-equipment-shop');

  // Sync local coinage with global store
  $: {
    if ($npcCurrency) {
      npcCoinage = { ...$npcCurrency };
    }
  }

  // Update cart items whenever shopCart changes
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

  // Cache for enriched item names
  let enrichedNames = {};

  // Helper to get enriched HTML for item name
  async function getEnrichedName(item) {
    const key = item.uuid || item._id || item.id;
    if (!enrichedNames[key]) {
      enrichedNames[key] = await enrichHTML(item.enrichedName || item.name || "", { async: true });
    }
    return enrichedNames[key];
  }

  // Add item to cart
  async function addToCart(item) {
    try {
      const itemId = item.id || item._id;
      
      if (!itemId) {
        console.error("Item has no id:", item);
        ui.notifications?.warn(t('Shop.ErrorItemNoId'));
        return;
      }

      const fullItemData = await fromUuid(item.uuid);
      if (!fullItemData) {
        console.error("Could not load full item data for UUID:", item.uuid);
        ui.notifications?.warn(t('Shop.ErrorLoadingItem'));
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
      ui.notifications?.warn(t('Shop.ErrorAddToCart'));
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
      ui.notifications?.warn(t('Shop.ErrorUpdateQuantity'));
    }
  }
  
  // Remove item from cart completely
  function removeFromCart(itemId) {
    try {
      updateCart(itemId, 0, null);
    } catch(error) {
      console.error("Error removing item from cart:", error);
      ui.notifications?.warn(t('Shop.ErrorRemoveFromCart'));
    }
  }

  // Handle coinage updates
  function handleCoinageUpdate(event) {
    // Extract the coinage data from the CustomEvent detail
    const newCoinage = event.detail;
    console.log('Parent received coinage update:', newCoinage);
    npcCurrency.set(newCoinage);
    // Also update local state so the child component gets the new values
    npcCoinage = { ...newCoinage };
    console.log('Updated local npcCoinage:', npcCoinage);
  }

  function handleCoinageToggle() {
    editingCoinage = !editingCoinage;
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

  let scrolled = false;
  let shopContainer;
  let cleanup;

  /**
   * Auto-roll gold for NPCs based on their CR
   */
  async function autoRollGold() {
    try {
      // Get the NPC's CR for gold calculation
      const npcCR = $selectedNpcBase?.system?.details?.cr?.value ?? 0;
      
      // Calculate gold based on CR (DMG table)
      let goldAmount = 0;
      if (npcCR <= 4) {
        goldAmount = new Roll("6d6 * 100").evaluate().total; // 600-3600 gp
      } else if (npcCR <= 10) {
        goldAmount = new Roll("3d6 * 1000").evaluate().total; // 3000-18000 gp
      } else if (npcCR <= 16) {
        goldAmount = new Roll("4d6 * 1000").evaluate().total; // 4000-24000 gp
      } else {
        goldAmount = new Roll("8d6 * 1000").evaluate().total; // 8000-48000 gp
      }
      
      // Set the rolled gold amount
      const newCurrency = { pp: 0, gp: goldAmount, ep: 0, sp: 0, cp: 0 };
      npcCurrency.set(newCurrency);
      
      // Log the roll
      window.GAS?.log?.d?.('[NPC Equipment Shop] Auto-rolled gold:', { npcCR, goldAmount, newCurrency });
      
    } catch (error) {
      console.error('Error auto-rolling gold:', error);
      // Fallback to default 10 GP if roll fails
      npcCurrency.set({ pp: 0, gp: 10, ep: 0, sp: 0, cp: 0 });
    }
  }

  onMount(async () => {
    loading = true;
    
    // Auto-roll gold if not already set
    if (!$npcCurrency || Object.values($npcCurrency).every(v => v === 0)) {
      await autoRollGold();
    }
    
    // Initialize local coinage from global store
    npcCoinage = { ...$npcCurrency };
    
    // Load shop items
    await loadShopItems();
    
    loading = false;

    // Find the actual scrolling container (section.a from PCAppShell)
    const scrollingContainer = document.querySelector('#foundryvtt-actor-studio-pc-sheet section.a');
    if (scrollingContainer) {
      const handleScroll = () => {
        scrolled = scrollingContainer.scrollTop > 0;
      };
      scrollingContainer.addEventListener('scroll', handleScroll);
      
      // Cleanup on destroy
      cleanup = () => {
        scrollingContainer.removeEventListener('scroll', handleScroll);
      };
    }
  });
 
  onDestroy(() => {
    if (cleanup) {
      cleanup();
    }
  });
</script>

<StandardTabLayout
  title="NPC Equipment Shop"
  showTitle={true}
  tabName="npc-equipment-shop"
>
  <div slot="left" class="shop-left-panel">
    {#if isDisabled}
      <div class="info-message">{t('Shop.ShopReadOnly')}</div>
    {/if}
    
    <!-- NPC Coinage Management -->
    <NPCCoinageManager 
      coinage={npcCoinage}
      isEditing={editingCoinage}
      disabled={isDisabled}
      selectedNpc={$selectedNpcBase}
      on:update={handleCoinageUpdate}
      on:toggleEdit={handleCoinageToggle}
    />

    <h3>Cart Items</h3>
    <div class="cart-items">
      {#if cartItems.length === 0}
        <div class="empty-cart">
          <p>Cart is empty</p>
        </div>
      {:else}
        {#each cartItems as cartItem}
          <div class="cart-item">
            <div class="cart-item-col1">
              <img src={cartItem.item.img} alt={cartItem.item.name} class="item-icon" />
            </div>
            <div class="cart-item-col2 left">
              <div class="cart-item-name">
                {#await getEnrichedName(cartItem.item)}
                  {cartItem.item.name}
                {:then Html}
                  {@html Html}
                {/await}
              </div>
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

  <div slot="right" class="shop-right-panel">
    <h3>Available Equipment</h3>
    
    <!-- Keyword Filter Input -->
    <div class="filter-container mb-sm">
      <input 
        type="text" 
        bind:value={keywordFilter} 
        placeholder="Filter equipment..." 
        class="keyword-filter"
        disabled={isDisabled}
      />
    </div>

    {#if loading}
      <div class="loading">Loading...</div>
    {:else if filteredItems.length === 0}
      <div class="empty-state">
        <p>{keywordFilter ? 'No matching equipment found' : 'No equipment available'}</p>
      </div>
    {:else}
      {#each categories as category}
        <div class="category">
          <button class="category-header left mt-sm flexrow pointer" on:click={() => toggleCategory(category)}>
            <div class="flex0 mr-xs">
              {#if expandedCategories[category]}
                <span>[-]</span>
              {:else}
                <span>[+]</span>
              {/if}
            </div>
            <div class="flex">{category}</div>
          </button>
          {#if expandedCategories[category]}
            {#each categoryGroups[category] as item (item.uuid || item._id)}
              <div class="item-row">
                <div class="item-details">
                  <img src={item.img} alt={item.name} class="item-icon" />
                  <span class="item-name">
                    {#await getEnrichedName(item)}
                      {item.name}
                    {:then Html}
                      {@html Html}
                    {/await}
                  </span>
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
</StandardTabLayout>

<style lang="sass">
  @import "../../../../../styles/features/equipment-purchase.sass"

  :global(.GAS.theme-dark .cart-item .cart-item-price)
    color: silver

  :global(.GAS.theme-dark .item-row .item-actions .item-price)
    color: silver
  :global(.GAS.theme-dark .cart-item .quantity-display)
    background: rgba(255, 255, 255, 0.1) !important
    color: silver !important 

  .info-message
    font-size: 0.8rem
    color: #666
    font-style: italic
    margin: 1rem
    padding: 1rem
    background: rgba(0, 0, 0, 0.05)
    border-radius: var(--border-radius)

  .shop-left-panel
    display: flex
    flex-direction: column
    height: 100%
    overflow-y: auto

  .shop-right-panel
    display: flex
    flex-direction: column
    height: 100%
    overflow-y: auto

  h3
    margin-bottom: 0.5rem
    border-bottom: 1px solid var(--color-border-light-highlight)
    padding-bottom: 0.25rem

  .loading, .empty-state, .empty-cart
    padding: 1rem
    text-align: center
    color: var(--color-text-dark-secondary)

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
      cursor: pointer
      padding: 0.25rem 0 0.25rem 0.25rem
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
    .category-header
      background: none
      border: none
      cursor: pointer
      color: var(--color-highlight)
      font-size: 1rem
      margin-bottom: 0.2rem
      padding-bottom: 0.1rem
      border-bottom: 1px solid var(--color-border-light-highlight)
      width: 100%
      text-align: left
      font-weight: bold

      &:hover
        background: rgba(0, 0, 0, 0.05)

      &:disabled
        opacity: 0.5
        cursor: not-allowed
        &:hover
          background: none

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
    padding: 0 0.25rem
    margin-bottom: 0.5rem

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

  .mb-sm
    margin-bottom: 0.5rem

  .mt-sm
    margin-top: 0.5rem

  .flexrow
    display: flex
    align-items: center

  .flex0
    flex: 0 0 auto

  .flex
    flex: 1

  .mr-xs
    margin-right: 0.25rem

  .pointer
    cursor: pointer

  .left
    text-align: left
</style>
