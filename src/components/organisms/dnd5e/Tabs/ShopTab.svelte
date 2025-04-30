<script>
  import { shopItems, shopCart, availableGold, cartTotalCost, remainingGold, updateCart, loadShopItems, finalizePurchase, initializeGold } from '../../../../stores/equipmentShop';
  import { actorInGame } from '../../../../stores/index';
  import GoldDisplay from '../../../molecules/GoldDisplay.svelte';
  import { PurchaseHandler } from '../../../../plugins/equipment-purchase/handlers/PurchaseHandler';
  import { onMount, tick } from 'svelte';
  import { localize } from "#runtime/svelte/helper";
  import { get } from 'svelte/store';

  let availableCurrency = { gp: 0, sp: 0, cp: 0 };
  let cartCurrency = { gp: 0, sp: 0, cp: 0 };
  let remainingCurrency = { gp: 0, sp: 0, cp: 0 };
  let loading = true;
  let cartItems = [];

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

  // Update cart items whenever shopCart or shopItems changes
  $: {
    if ($shopItems && $shopCart) {
      cartItems = Array.from($shopCart.entries()).map(([itemId, quantity]) => {
        const item = $shopItems.find(i => i.id === itemId);
        if (item) {
          return {
            id: itemId,
            item,
            quantity,
            // Calculate price for display
            price: {
              value: item.system?.price?.value || 0,
              denomination: item.system?.price?.denomination || 'cp'
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
  function addToCart(item) {
    try {
      // For Foundry Document objects, get the id property directly
      const itemId = item.id || item._id; 
      
      if (!itemId) {
        console.error("Item has no id:", item);
        ui.notifications?.warn("Failed to add item to cart: Missing item id");
        return;
      }
      
      // Get current cart from the store
      const cart = get(shopCart);
      
      // Get current quantity with a fallback to 0
      const currentQuantity = cart.has(itemId) ? cart.get(itemId) : 0;
      
      // Get the bundle quantity from the item data
      const bundleQuantity = item.system?.quantity || 1;
      
      // Add the bundle quantity instead of just 1
      const newQuantity = currentQuantity + bundleQuantity;
      
      // Update cart safely
      updateCart(itemId, newQuantity);
      
      ui.notifications?.info(`Added ${item.name} to cart`);
    } catch(error) {
      console.error("Error adding item to cart:", error);
      ui.notifications?.warn("Failed to add item to cart");
    }
  }
  
  // Update item quantity in cart
  function updateItemQuantity(itemId, newQuantity) {
    try {
      // Ensure minimum quantity is 0
      const quantity = Math.max(0, newQuantity);
      // Update cart
      updateCart(itemId, quantity);
    } catch(error) {
      console.error("Error updating item quantity:", error);
      ui.notifications?.warn("Failed to update item quantity");
    }
  }
  
  // Remove item from cart completely
  function removeFromCart(itemId) {
    try {
      updateCart(itemId, 0);
    } catch(error) {
      console.error("Error removing item from cart:", error);
      ui.notifications?.warn("Failed to remove item from cart");
    }
  }

  // Filter and group items by category
  $: categoryGroups = $shopItems.reduce((acc, item) => {
    const category = item.type.charAt(0).toUpperCase() + item.type.slice(1) + 's';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Sort categories for consistent display order
  $: categories = Object.keys(categoryGroups).sort();
</script>

<div class="shop-tab">
  <!-- Left Panel: Cart Items and Gold Info -->
  <div class="left-panel">
    <h3>Available Gold</h3>
    <GoldDisplay {...availableCurrency} />
    
    <h3>Cart Total</h3>
    <GoldDisplay {...cartCurrency} />

    <h3>Remaining Gold</h3>
    <div class:negative={$remainingGold < 0} class="remaining-currency">
      <GoldDisplay {...remainingCurrency} />
    </div>

    <h3>Cart Items</h3>
    <div class="cart-items">
      {#if cartItems.length === 0}
        <div class="empty-cart">
          <p>Your cart is empty</p>
        </div>
      {:else}
        {#each cartItems as cartItem}
          <div class="cart-item">
            <img src={cartItem.item.img} alt={cartItem.item.name} class="item-icon" />
            <div class="cart-item-details">
              <div class="cart-item-name">{getItemDisplayName(cartItem.item)}</div>
              <div class="cart-item-controls">
                <div class="cart-item-price">{cartItem.price.value} {cartItem.price.denomination}</div>
                <div class="cart-item-info">
                  <span class="quantity-display">×{cartItem.quantity}</span>
                </div>
                <button class="remove-btn" on:click={() => removeFromCart(cartItem.id)}>
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Right Panel: Available Equipment -->
  <div class="right-panel item-list">
    <h3>Available Equipment</h3>
    
    {#if loading}
      <div class="loading">Loading items...</div>
    {:else if $shopItems.length === 0}
      <div class="empty-state">
        <p>No equipment available. Please check your compendium sources in the module settings.</p>
      </div>
    {:else}
      {#each categories as category}
        <div class="category">
          <h4>{category}</h4>
          {#each categoryGroups[category] as item (item.id)}
            <div class="item-row">
              <div class="item-details">
                <img src={item.img} alt={item.name} class="item-icon" />
                <span class="item-name">{getItemDisplayName(item)}</span>
              </div>
              <div class="item-actions">
                <span class="item-price">
                  {item.system?.price?.value || 0} {item.system?.price?.denomination || 'cp'}
                </span>
                <button class="add-btn" on:click|preventDefault={() => addToCart(item)}>
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style lang="scss">
  /* Add additional component-specific styles here */
  @import "../../../../../styles/features/equipment-purchase.scss";

  .shop-tab {
    display: flex;  /* Changed from grid to flex */
    height: 100%;
    overflow: hidden;
  }

  .left-panel {
    flex: 1;  /* Take 1/3 of the space */
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    padding: 0.5rem;
    border-right: 1px solid var(--color-border-light-tertiary);
  }

  .right-panel {
    flex: 2;  /* Take 2/3 of the space */
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    padding: 0.5rem;
  }

  h3 {
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border-light-highlight);
    padding-bottom: 0.25rem;
  }

  .loading, .empty-state, .empty-cart {
    padding: 1rem;
    text-align: center;
    color: var(--color-text-dark-secondary);
  }

  .remaining-currency {
    margin-bottom: 1rem;
    
    &.negative {
      :global(.currency-display) {
        background-color: rgba(255, 0, 0, 0.1);
        border-color: rgba(255, 0, 0, 0.5);
      }
    }
  }

  .cart-items {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cart-item {
    display: flex;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid var(--color-border-light-tertiary);
    border-radius: 3px;
    align-items: center;
    gap: 0.5rem;

    .item-icon {
      width: 32px;
      height: 32px;
      border: none;
    }

    .cart-item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .cart-item-controls {
      display: flex;
      justify-content: flex-end; /* Right align all content */
      align-items: center;
      gap: 0.75rem; /* Increase spacing between elements */
      width: 100%;
    }

    .cart-item-price {
      color: var(--color-text-dark-secondary);
      font-size: 0.9rem;
    }

    .cart-item-info {
      display: flex;
      align-items: center;
      
      .quantity-display {
        background: rgba(0, 0, 0, 0.1);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-weight: bold;
        min-width: 2rem;
        text-align: center;
      }
    }

    .remove-btn {
      background: none;
      border: none;
      color: #990000;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 3px;
      
      &:hover {
        background: rgba(153, 0, 0, 0.1);
      }
    }
  }

  .category {
    margin-bottom: 1rem;

    h4 {
      margin-bottom: 0.5rem;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid var(--color-border-light-highlight);
    }
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem;
    align-items: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  .item-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    
    .item-icon {
      width: 24px;
      height: 24px;
      border: none;
    }
  }

  .item-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 80px; /* Ensure consistent width */
    justify-content: flex-end; /* Right align contents */

    .item-price {
      color: var(--color-text-dark-secondary);
      font-size: 0.9rem;
    }

    .add-btn {
      background: var(--dnd5e-color-gold, #b59e54);
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 3px;
      color: black;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      
      &:hover {
        background: darken(#b59e54, 10%);
      }
    }
  }
</style>