<svelte:options accessors={true} />

<script>
   import { getContext }            from 'svelte';
   import { TJSApplicationShell }   from '@typhonjs-fvtt/runtime/svelte/component/application';
   import { Timing }                from '#runtime/util';
   import SettingsFooter            from './SettingsFooter.svelte';
   import { sessionConstants }      from '~/src/helpers/constants';
   import { MODULE_ID }             from '~/src/helpers/constants';
   import { camelCaseToTitleCase, safeGetSetting }  from '~/src/helpers/Utility';

   export let elementRoot;

   const { application } = getContext('#external');

   // Get a store that is synchronized with session storage.
   const stateStore = application.reactive.sessionStorage.getStore(sessionConstants.appState);

   // Application position store reference. Stores need to be a top level variable to be accessible for reactivity.
   const position = application.position;

   // A debounced callback that serializes application state after 500-millisecond delay.
   const storePosition = Timing.debounce(() => $stateStore = application.state.get(), 500);

   // Reactive statement to invoke debounce callback on Position changes.
   $: storePosition($position);

   // Settings state
   let enableDonationTracker = safeGetSetting(MODULE_ID, 'enable-donation-tracker', false);
   let enableUnregisteredAccess = safeGetSetting(MODULE_ID, 'enable-donation-tracker-unregistered-access', false);
   let membershipRanks = game.membership?.RANKS || {};
   let rankSettings = {};

   // Initialize rank settings
   $: {
      rankSettings = {};
      if (Object.keys(membershipRanks).length > 0) {
         for (const [rank, value] of Object.entries(membershipRanks)) {
            if (value === -1) continue;
            const key = `donation-tracker-rank-${rank}`;
            rankSettings[rank] = safeGetSetting(MODULE_ID, key, '');
         }
      }
   }

   // Update functions
   function updateEnableDonationTracker() {
      game.settings.set(MODULE_ID, 'enable-donation-tracker', enableDonationTracker);
   }

   function updateEnableUnregisteredAccess() {
      game.settings.set(MODULE_ID, 'enable-donation-tracker-unregistered-access', enableUnregisteredAccess);
   }

   function updateRankSetting(rank) {
      const key = `donation-tracker-rank-${rank}`;
      game.settings.set(MODULE_ID, key, rankSettings[rank]);
   }
</script>

<TJSApplicationShell bind:elementRoot>
   <main class="donation-tracker-settings">
      <div class="settings-section">
         <h3>Donation Tracker Settings</h3>
         
         <div class="setting-item">
            <label class="setting-label">
               <input 
                  type="checkbox" 
                  bind:checked={enableDonationTracker}
                  on:change={updateEnableDonationTracker}
               />
               {game.i18n.localize('GAS.Setting.DonationTrackerEnabled.Name')}
            </label>
            <p class="setting-hint">{game.i18n.localize('GAS.Setting.DonationTrackerEnabled.Hint')}</p>
         </div>

         <div class="setting-item">
            <label class="setting-label">
               <input 
                  type="checkbox" 
                  bind:checked={enableUnregisteredAccess}
                  on:change={updateEnableUnregisteredAccess}
               />
               {game.i18n.localize('GAS.Setting.DonationTracker_UnregisteredAccess.Name')}
            </label>
            <p class="setting-hint">{game.i18n.localize('GAS.Setting.DonationTracker_UnregisteredAccess.Hint')}</p>
         </div>
      </div>

      {#if Object.keys(membershipRanks).length > 0}
         <div class="settings-section">
            <h3>Membership Ranks</h3>
            {#each Object.entries(membershipRanks) as [rank, value]}
               {#if value !== -1}
                  <div class="setting-item">
                     <label class="setting-label">
                        {camelCaseToTitleCase(rank)}:
                        <input 
                           type="text" 
                           bind:value={rankSettings[rank]}
                           on:change={() => updateRankSetting(rank)}
                           placeholder={camelCaseToTitleCase(rank)}
                        />
                     </label>
                     <p class="setting-hint">
                        {game.i18n.localize('GAS.Setting.DonationTrackerRank.Hint')}: {camelCaseToTitleCase(rank)}
                     </p>
                  </div>
               {/if}
            {/each}
         </div>
      {/if}

      <SettingsFooter slot=settings-footer />
   </main>
</TJSApplicationShell>

<style lang="sass">
   :root
      --tjs-settings-edit-background-color: rgba(0,0,0,0.9)
      --tjs-settings-edit-color: white
      --tjs-settings-entry-hint-color: #999
      --tjs-settings-entry-label-color: white

   :global(#gas-donation-tracker-settings)
      background-color: rgba(0,0,0,0.9)
      color: white

   :global(#gas-donation-tracker-settings .tjs-input)
      color: white

   .donation-tracker-settings
      padding: 1rem
      color: white
      background-color: rgba(0,0,0,0.9)

   .settings-section
      margin-bottom: 2rem

   .settings-section h3
      color: white
      border-bottom: 1px solid #666
      padding-bottom: 0.5rem
      margin-bottom: 1rem

   .setting-item
      margin-bottom: 1.5rem

   .setting-label
      display: flex
      align-items: center
      gap: 0.5rem
      color: white
      font-weight: bold
      margin-bottom: 0.25rem

   .setting-label input[type="checkbox"]
      margin: 0

   .setting-label input[type="text"]
      margin-left: 0.5rem
      padding: 0.25rem 0.5rem
      background-color: #333
      border: 1px solid #666
      color: white
      border-radius: 3px

   .setting-hint
      color: #999
      font-size: 0.9em
      margin: 0.25rem 0 0 1.5rem
</style>