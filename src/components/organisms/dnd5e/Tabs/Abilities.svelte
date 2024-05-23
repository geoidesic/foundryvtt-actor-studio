<script>
  import SvelteSelect from 'svelte-select';
  import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, log, getRules } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount } from "svelte";
  import Tabs from '~/src/components/molecules/Tabs.svelte';
  import ManualEntry from '~/src/components/organisms/dnd5e/AbilityEntry/ManualEntry.svelte';
  import { localize } from "#runtime/svelte/helper";
  
  const actor = getContext("#doc");
  const ruleConfig = { journalId: '0AGfrwZRzSG0vNKb', pageId: 'yuSwUFIjK31Mr3DI' };

  let rules = '';
  
  $: actorObject = $actor.toObject();
  $: html = rules?.content || '';

  onMount(async () => {
      rules = await getRules(ruleConfig);
  });
    
</script>
    
<template lang="pug">
  div.tab-content
    .flexrow
      .flex2.pr-sm
        h3.left {localize('GAS.Tabs.Abilities.HowCalculated')}
        ol.properties-list
          li Manual Entry
        ManualEntry
      .flex0.border-right.right-border-gradient-mask 
      .flex3.left.pl-md.scroll(bind:innerHTML="{html}" contenteditable)
</template>

<style lang="sass" scoped>
@import "../../../../../styles/Mixins.scss"
.tab-content 
  @include staticOptions
  position: relative
  padding: 0
  .scroll
    overflow-y: auto
    height: 580px
    box-sizing: content-box
    padding-right: 15px
</style>