<script>
  import { shopItems, shopCart, availableGold, cartTotalCost, remainingGold, updateCart, loadShopItems, finalizePurchase } from '../../stores/equipmentShop';
  import { actorInGame } from '../../stores/index';
  import GoldDisplay from '../molecules/GoldDisplay.svelte';
  import { PurchaseHandler } from '../../plugins/equipment-purchase/handlers/PurchaseHandler';
  import { onMount } from 'svelte';
  import { localize } from "#runtime/svelte/helper";

  let availableCurrency = { gp: 0, sp: 0, cp: 0 };
  let cartCurrency = { gp: 0, sp: 0, cp: 0 };
  let remainingCurrency = { gp: 0, sp: 0, cp: 0 };
  let loading = true;

  // Fetch items when component mounts
  onMount(async () => {
    loading = true;
    await loadShopItems();
    loading = false;
  });

  // Reactive updates for currency display
  $: availableCurrency = PurchaseHandler.formatCurrency($availableGold);
  $: cartCurrency = PurchaseHandler.formatCurrency($cartTotalCost);
  $: remainingCurrency = PurchaseHandler.formatCurrency($remainingGold);

  function handleQuantityChange(itemId, change) {
    const currentQuantity = $shopCart.get(itemId) || 0;
    const newQuantity = Math.max(0, currentQuantity + change); // Ensure quantity doesn't go below 0
    updateCart(itemId, newQuantity);
  }

  async function handleFinalizePurchase() {
    if (!$actorInGame) {
      ui.notifications.error("No active character found");
      return;
    }

    if ($cartTotalCost === 0) {
      ui.notifications.warn("Cart is empty");
      return;
    }

    if ($remainingGold < 0) {
      ui.notifications.error("Not enough gold for purchase");
      return;
    }

    const success = await finalizePurchase($actorInGame);
    
    if (success) {
      ui.notifications.info("Purchase completed successfully");
      // Close the Actor Studio window after successful purchase
      setTimeout(() => {
        Hooks.call("gas.close");
      }, 1500);
    } else {
      ui.notifications.error("Failed to complete purchase");
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
  <div class="left-panel">
    <h3>Available Gold</h3>
    <GoldDisplay {...availableCurrency} />
    
    <h3>Cart Total</h3>
    <GoldDisplay {...cartCurrency} />

    <h3>Remaining Gold</h3>
    <div class:negative={$remainingGold < 0} class="remaining-currency">
      <GoldDisplay {...remainingCurrency} />
    </div>

    <button 
      class="finalize-button"
      on:click={handleFinalizePurchase} 
      disabled={$cartTotalCost === 0 || $remainingGold < 0}>
      Finalize Purchase
    </button>
  </div>

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
                <span class="item-name">{item.name}</span>
              </div>
              <span class="item-price">
                {item.system?.price?.value || 0} {item.system?.price?.denomination || 'cp'}
              </span>
              <div class="quantity-control">
                <button class="qty-btn minus" on:click={() => handleQuantityChange(item.id, -1)}>-</button>
                <input 
                  type="number" 
                  value={$shopCart.get(item.id) || 0} 
                  min="0" 
                  readonly 
                  class="qty-input"
                />
                <button class="qty-btn plus" on:click={() => handleQuantityChange(item.id, 1)}>+</button>
              </div>
            </div>
          {/each}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style lang="scss">
  @import '../../../styles/features/equipment-purchase.scss';

  .loading, .empty-state {
    padding: 2rem;
    text-align: center;
    color: var(--color-text-dark-secondary);
  }

  .remaining-currency {
    &.negative {
      :global(.currency-display) {
        background-color: rgba(255, 0, 0, 0.1);
        border-color: rgba(255, 0, 0, 0.5);
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

  .item-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .item-icon {
      width: 24px;
      height: 24px;
      border: none;
    }
  }

  .finalize-button {
    margin-top: 1rem;
    width: 100%;
    background: var(--dnd5e-color-gold, #b59e54);
    color: black;
    font-weight: bold;
    padding: 0.5rem;
    border: 1px solid var(--color-border-light-tertiary);
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: darken(#b59e54, 10%);
    }
    
    &:disabled {
      background: #999;
      cursor: not-allowed;
    }
  }

  .qty-btn {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-btn-minor-inactive);
    border: 1px solid var(--color-border-light-tertiary);
    cursor: pointer;

    &:hover {
      background: var(--color-bg-btn-minor-active);
    }

    &.minus {
      border-radius: 4px 0 0 4px;
    }

    &.plus {
      border-radius: 0 4px 4px 0;
    }
  }

  .qty-input {
    width: 30px;
    text-align: center;
    border: 1px solid var(--color-border-light-tertiary);
    border-left: none;
    border-right: none;
    background: var(--color-bg-field);
  }

  .item-price {
    font-size: 0.9rem;
    color: var(--dnd5e-color-gold, #b59e54);
  }
</style>
