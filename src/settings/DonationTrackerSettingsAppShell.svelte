<svelte:options accessors={true} />

<script>
   import { getContext }            from 'svelte';

   import { TJSApplicationShell }   from '@typhonjs-fvtt/runtime/svelte/component/application';
   import { Timing }                from '#runtime/util';

   import { TJSSettingsEdit }       from '@typhonjs-fvtt/standard/component/fvtt/settings';

   import SettingsFooter            from './SettingsFooter.svelte';

   import DonationTrackerGameSettings  from './DonationTrackerGameSettings.js';

   import { sessionConstants }      from '~/src/helpers/constants';

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
</script>

<TJSApplicationShell bind:elementRoot>
   <TJSSettingsEdit settings={DonationTrackerGameSettings} options={{ storage: application.reactive.sessionStorage }}>
      <SettingsFooter slot=settings-footer />
   </TJSSettingsEdit>
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
</style>