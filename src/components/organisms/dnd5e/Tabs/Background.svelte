<script>
  import SvelteSelect from 'svelte-select';
  import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
  import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, log } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import { background } from "~/src/helpers/store"
  
  let active = null, value = null, placeHolder = "Backgrounds";
  let pack = game.packs.get('dnd5e.backgrounds');
  let folders = getPackFolders(pack, 1);
  let folderIds = folders.map(x => x._id);
  let allItems = extractMapIteratorObjectProperties(pack.index.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', '_id']);
  let itemDefinitions = allItems.filter(x => !folderIds.includes(x.folder));
  
  const actor = getContext("#doc");
  
  $: options = itemDefinitions;
  $: html = $background?.system?.description.value || '';
  $: backgroundFolders = folders.filter(x => x.depth == 1 && x.name.includes($background?.name))
  $: equipmentFolderId = backgroundFolders.find(x => x.name == $background.name+' Equipment')?.key
  $: featureFolderId = backgroundFolders.find(x => x.name == $background.name+' Feature')?.key
  $: equipment = equipmentFolderId ? allItems.filter(x => x.folder == equipmentFolderId) : [];
  $: features = featureFolderId ? allItems.filter(x => x.folder == featureFolderId) : [];
  $: advancementArray = $background?.advancement?.byId ? Object.entries($background.advancement.byId).map(([id, value]) => ({ ...value, id })) : [];

  $: log.d('advancementArray', advancementArray)


  let richHTML = '';
  
  const selectHandler = async (option) => {
    $background = await fromUuid(option)
    active = option; 
    await tick();
    richHTML = await TextEditor.enrichHTML(html);
  }

  const importPath = '../../../molecules/dnd5e/Advancements/';
  const importComponent = async (componentName) => {
    const { default: Component } = await import( /* @vite-ignore */`${importPath}${componentName}.svelte`);
    return Component;
  };

  
  onMount(async () => {
    if($background) {
      value = $background.uuid;
      richHTML = await TextEditor.enrichHTML(html);
    }
  });
</script>
    
<template lang="pug">
div.content
  .flexrow
    .flex2.pr-sm.col-a
      IconSelect.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="background-select" bind:value )
      +if("backgroundFolders")
        +if("equipmentFolderId")
          h3.left Equipment
          ul.icon-list
            +each("equipment as item")
              li.left.tight
                .flexrow
                  .flex0.relative.image.mr-xs
                    img.icon(src="{item.img}" alt="{item.label}")
                  .flex2.flexcol 
                    .caption {item.label}
                    .caption.light {item.type}
        +if("featureFolderId")
          h3.left Features
          ul.icon-list
            +each("features as item")
              li.left.tight
                .flexrow
                  .flex0.relative.image.mr-xs
                    img.icon(src="{item.img}" alt="{item.label}")
                  .flex2.flexcol 
                    .caption {item.label}
                    .caption.light {item.type}

        +if("advancementArray.length")
          h3.left {localize('GAS.Advancements')}
          ul.icon-list
            +each("advancementArray as advancement")
              //- @todo: this should be broken out into components for each advancement.type
              li.left
                .flexrow(data-tooltip="{advancement.configuration?.hint || ''}")
                  .flex0.relative.image
                    img.icon(src="{advancement.icon}" alt="{advancement.title}")
                  .flex2 {advancement.title}
                +await("importComponent(advancement.type)")
                  +then("Component")
                    svelte:component(this="{Component}" advancement="{advancement}")

    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b(bind:innerHTML="{richHTML}" contenteditable)

</template>
  

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .content 
    @include staticOptions

  :global(.icon-select)
    position: relative

</style>