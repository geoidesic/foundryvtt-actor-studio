<script>
  import SvelteSelect from 'svelte-select';
  import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, log, getRules } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import Tabs from '~/src/components/molecules/Tabs.svelte';
  import ManualEntry from '~/src/components/organisms/dnd5e/AbilityEntry/ManualEntry.svelte';
  import { localize } from "#runtime/svelte/helper";
  
  const actor = getContext("#doc");
  const ruleConfig = { journalId: 'QvPDSUsAiEn3hD8s', pageId: 'evx9TWix4wYU51a5' };

  let rules = '', richHTML = '';
  
  $: actorObject = $actor.toObject();
  $: html = rules?.content || '';

  onMount(async () => {
      rules = await getRules(ruleConfig);
      await tick();
      richHTML = await TextEditor.enrichHTML(html);
  });
    
</script>
    
<template lang="pug">
  div.content
    .flexrow
      .flex2.pr-sm.col-a
      .flex0.border-right.right-border-gradient-mask 
      .flex3.left.pl-md.scroll.col-b(bind:innerHTML="{richHTML}" contenteditable)
</template>

<style lang="sass" scoped>
@import "../../../../../styles/Mixins.scss"
.content 
  @include staticOptions
</style>