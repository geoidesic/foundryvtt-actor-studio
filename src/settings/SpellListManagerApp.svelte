<svelte:options accessors={true} />

<script>
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import { TJSApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { MODULE_ID } from '~/src/helpers/constants';

  export let elementRoot;

  const { application } = getContext('#external');

  let spellLists = [];
  let selectedList = null;
  let resolvedSpells = {};
  let dragOver = false;
  let dragCounter = 0;

  const availableClasses = [
    'artificer', 'bard', 'cleric', 'druid', 'fighter', 'monk',
    'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
  ];

  onMount(async () => {
    spellLists = await game.settings.get(MODULE_ID, 'customSpellLists') || [];
    // Pre-warm the cache for all spells across all lists so they're ready before a list is clicked
    const allUuids = new Set(spellLists.flatMap(l => l.spells || []));
    for (const uuid of allUuids) {
      resolveSpell(uuid);
    }
  });

  async function resolveSpell(uuid) {
    // Only skip if already successfully resolved (not null/undefined)
    if (resolvedSpells[uuid] && resolvedSpells[uuid] !== true) return resolvedSpells[uuid];
    // Mark as in-flight to prevent duplicate concurrent fetches
    resolvedSpells[uuid] = true;
    try {
      const doc = await fromUuid(uuid);
      resolvedSpells[uuid] = doc ?? { name: 'Not Found', img: 'icons/svg/mystery-man.svg', error: true };
      resolvedSpells = { ...resolvedSpells };
    } catch (error) {
      resolvedSpells[uuid] = { name: 'Unknown Spell', img: 'icons/svg/mystery-man.svg', error: true };
      resolvedSpells = { ...resolvedSpells };
    }
    return resolvedSpells[uuid];
  }

  function createNewList() {
    const newList = {
      id: foundry.utils.randomID(),
      name: 'New Spell List',
      type: 'class',
      identifier: '',
      description: '',
      spells: []
    };
    spellLists = [...spellLists, newList];
    selectedList = newList;
  }

  async function saveLists() {
    await game.settings.set(MODULE_ID, 'customSpellLists', spellLists);
    ui.notifications.info('Spell lists saved. Reload the world to apply changes to spell filtering.');
  }

  async function handleSpellDrop(event) {
    event.preventDefault();
    dragOver = false;
    dragCounter = 0;
    if (!selectedList) return;
    
    console.log('SpellListManager: Drop event received', event);
    
    try {
      const dataString = event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain');
      console.log('SpellListManager: Raw drop data string', dataString);
      const data = JSON.parse(dataString);
      console.log('SpellListManager: Parsed drop data', data);
      
      // Handle individual spell drops
      if (data.type === 'Item' && data.uuid) {
        console.log('SpellListManager: Handling individual spell drop', data.uuid);
        if (!selectedList.spells.includes(data.uuid)) {
          selectedList.spells = [...selectedList.spells, data.uuid];
          spellLists = [...spellLists];
          resolveSpell(data.uuid);
        }
      }
      // Handle compendium drops - add all spells from the compendium
      else if (data.type === 'Compendium' && data.collection) {
        console.log('SpellListManager: Handling compendium drop', data.collection);
        const pack = game.packs.get(data.collection);
        if (!pack) {
          console.warn('SpellListManager: Compendium not found', data.collection);
          ui.notifications.warn(`Compendium "${data.collection}" not found.`);
          return;
        }
        
        console.log('SpellListManager: Getting documents from pack', pack.title);
        // Get all documents from the compendium
        const documents = await pack.getDocuments();
        console.log('SpellListManager: Retrieved documents', documents.length);
        // Filter for spells only
        const spellDocuments = documents.filter(doc => doc.type === 'spell');
        console.log('SpellListManager: Filtered spell documents', spellDocuments.length);
        
        if (spellDocuments.length === 0) {
          ui.notifications.warn(`No spells found in compendium "${pack.title}".`);
          return;
        }
        
        // Add all spell UUIDs that aren't already in the list
        const newSpellUuids = [];
        for (const spell of spellDocuments) {
          const uuid = spell.uuid;
          if (!selectedList.spells.includes(uuid)) {
            newSpellUuids.push(uuid);
            resolveSpell(uuid); // Pre-warm the cache
          }
        }
        
        console.log('SpellListManager: Adding new spells', newSpellUuids.length);
        if (newSpellUuids.length > 0) {
          selectedList.spells = [...selectedList.spells, ...newSpellUuids];
          spellLists = [...spellLists];
          ui.notifications.info(`Added ${newSpellUuids.length} spell(s) from "${pack.title}".`);
        } else {
          ui.notifications.info(`All spells from "${pack.title}" are already in this list.`);
        }
      } else {
        console.log('SpellListManager: Unhandled drop type', data.type, data);
      }
    } catch (err) {
      console.warn('SpellListManager: Invalid drop data', err);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDragEnter(event) {
    event.preventDefault();
    dragCounter++;
    dragOver = true;
  }

  function handleDragLeave() {
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      dragOver = false;
    }
  }

  function deleteList(list) {
    spellLists = spellLists.filter(l => l.id !== list.id);
    if (selectedList?.id === list.id) selectedList = null;
  }

  function selectList(list) {
    selectedList = list;
  }

  function removeSpellFromList(list, spellUuid) {
    list.spells = list.spells.filter(uuid => uuid !== spellUuid);
    spellLists = [...spellLists];
    selectedList = { ...selectedList }; // Trigger reactivity on selectedList
  }

  function getSpellLevel(spell) {
    const level = spell?.system?.level;
    if (level === 0) return 'Cantrip';
    if (level) return `Level ${level}`;
    return '';
  }

  function getSpellSchool(spell) {
    return spell?.labels?.school || '';
  }

  function handleCancel() {
    application.close();
  }

  $: if (selectedList) {
    selectedList.spells.forEach(uuid => resolveSpell(uuid));
  }
</script>

<template lang="pug">
TJSApplicationShell(bind:elementRoot="{elementRoot}")
  main.spell-list-manager
    header.slm-toolbar
      button.slm-btn(type="button" on:click!="{createNewList}")
        i.fas.fa-plus
        |  New List
      .toolbar-spacer
      button.slm-btn(type="button" on:click!="{saveLists}")
        i.fas.fa-save
        |  Save

    .slm-content
      .list-panel
        h3.panel-heading
          i.fas.fa-scroll
          |  Spell Lists
        .list-entries
          +if("spellLists.length === 0")
            .empty-state
              i.fas.fa-inbox
              p No spell lists yet. Click "New List" to create one.
            +else()
              +each("spellLists as list")
                .list-entry(class:active!="{selectedList && selectedList.id === list.id}" on:click!="{selectList(list)}")
                  .list-entry-info
                    .list-entry-name {list.name}
                    .list-entry-meta {list.type}: {list.identifier || '(none)'}
                    .list-entry-count
                      i.fas.fa-hat-wizard
                      |  {list.spells.length} spell{list.spells.length !== 1 ? 's' : ''}
                  button.delete-btn(type="button" on:click|stopPropagation!="{deleteList(list)}" title="Delete list")
                    i.fas.fa-trash

      .editor-panel
        +if("selectedList")
          h3.panel-heading
            i.fas.fa-edit
            |  {selectedList.name}

          .editor-form
            .form-row
              .form-group
                label.form-label Name
                input.form-input(type="text" bind:value="{selectedList.name}" placeholder="Enter list name")
              .form-group
                label.form-label Type
                select.form-input(bind:value="{selectedList.type}")
                  option(value="class") Class
                  option(value="subclass") Subclass
                  option(value="race") Race
                  option(value="background") Background
                  option(value="feat") Feat
            .form-row
              .form-group
                label.form-label Identifier
                input.form-input(type="text" bind:value="{selectedList.identifier}" placeholder="e.g. wizard, eldritch-knight")
              .form-group
                label.form-label Description
                input.form-input(type="text" bind:value="{selectedList.description}" placeholder="Optional description")

          .spell-drop-zone(class:drag-active!="{dragOver}" on:drop!="{handleSpellDrop}" on:dragover!="{handleDragOver}" on:dragenter!="{handleDragEnter}" on:dragleave!="{handleDragLeave}")
            +if("selectedList.spells.length === 0 && !dragOver")
              .drop-placeholder
                i.fas.fa-hand-sparkles
                p Drag spells or entire compendiums from the sidebar to add them here
              +else()
                +if("dragOver")
                  .drop-placeholder.active
                    i.fas.fa-bullseye
                    p Drop to add spell
                +each("selectedList.spells as spellUuid")
                  .spell-row
                    .spell-icon-wrap
                      img.spell-icon(src="{resolvedSpells[spellUuid]?.img || 'icons/svg/mystery-man.svg'}" alt="{resolvedSpells[spellUuid]?.name || 'Loading'}")
                    .spell-info
                      .spell-name {resolvedSpells[spellUuid]?.name || 'Loading...'}
                      .spell-meta
                        +if("getSpellLevel(resolvedSpells[spellUuid])")
                          span.spell-badge {getSpellLevel(resolvedSpells[spellUuid])}
                        +if("getSpellSchool(resolvedSpells[spellUuid])")
                          span.spell-badge {getSpellSchool(resolvedSpells[spellUuid])}
                    .spell-actions
                      button.remove-btn(type="button" on:click!="{removeSpellFromList(selectedList, spellUuid)}" title="Remove spell")
                        i.fas.fa-times

          +else()
            .no-selection
              i.fas.fa-arrow-left
              p Select a spell list from the left panel to edit it

    footer.slm-footer
      button.slm-btn(type="button" on:click!="{handleCancel}") Cancel
      button.slm-btn.save-btn(type="button" on:click!="{saveLists}")
        i.fas.fa-save
        |  Save
</template>

<style lang="sass">
  :global(#spell-list-manager)
    background-color: rgba(0, 0, 0, 0.9)
    color: white

  :global(#spell-list-manager .window-content)
    padding: 0
    overflow: hidden

  .spell-list-manager
    display: flex
    flex-direction: column
    height: 100%
    color: white
    background: rgba(0, 0, 0, 0.9)

  .slm-toolbar
    display: flex
    align-items: center
    gap: 0.5rem
    padding: 0.5rem 0.75rem
    background: #222
    border-bottom: 1px solid #666
    position: sticky
    top: 0
    z-index: 2

  .toolbar-spacer
    flex: 1

  .slm-btn
    background: #444
    border: 1px solid #666
    color: white
    padding: 0.35rem 0.75rem
    border-radius: 3px
    cursor: pointer
    font-size: 0.9em
    display: flex
    align-items: center
    gap: 0.35rem

    &:hover
      background: #555

    i
      font-size: 0.85em

  .slm-content
    flex: 1
    display: flex
    overflow: hidden

  .list-panel
    flex: 0 0 260px
    border-right: 1px solid #666
    display: flex
    flex-direction: column
    overflow: hidden

  .panel-heading
    padding: 0.6rem 0.75rem
    margin: 0
    font-size: 0.95em
    font-weight: 700
    color: var(--dnd5e-color-gold, #b59e54)
    border-bottom: 1px solid #555
    display: flex
    align-items: center
    gap: 0.4rem

    i
      font-size: 0.85em

  .list-entries
    flex: 1
    overflow-y: auto
    padding: 0.5rem

  .empty-state
    text-align: center
    color: #888
    padding: 2rem 1rem

    i
      font-size: 2rem
      margin-bottom: 0.5rem
      display: block
      color: #555

    p
      font-style: italic
      font-size: 0.9em

  .list-entry
    display: flex
    align-items: center
    padding: 0.5rem 0.6rem
    border: 1px solid #555
    border-radius: 4px
    margin-bottom: 0.35rem
    cursor: pointer
    background: rgba(255, 255, 255, 0.03)
    transition: background 0.15s

    &:hover
      background: rgba(255, 255, 255, 0.08)

    &.active
      background: rgba(66, 109, 190, 0.2)
      border-color: var(--dnd5e-color-gold, #b59e54)

  .list-entry-info
    flex: 1
    min-width: 0

  .list-entry-name
    font-weight: 600
    font-size: 0.95em
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  .list-entry-meta
    font-size: 0.8em
    color: #999
    text-transform: capitalize

  .list-entry-count
    font-size: 0.75em
    color: var(--dnd5e-color-gold, #b59e54)
    margin-top: 0.15rem

    i
      font-size: 0.8em

  .delete-btn
    background: none
    border: none
    color: #888
    cursor: pointer
    padding: 0.25rem
    border-radius: 3px
    line-height: 1

    &:hover
      color: #cc4444
      background: rgba(200, 0, 0, 0.15)

  .editor-panel
    flex: 1
    display: flex
    flex-direction: column
    overflow-y: auto
    padding: 0.75rem

  .editor-form
    margin-bottom: 0.75rem

  .form-row
    display: flex
    gap: 0.75rem
    margin-bottom: 0.5rem

  .form-group
    flex: 1
    display: flex
    flex-direction: column

  .form-label
    font-size: 0.8em
    font-weight: 600
    color: var(--dnd5e-color-gold, #b59e54)
    margin-bottom: 0.2rem

  .form-input
    background: #333
    border: 1px solid #666
    color: white
    padding: 0.35rem 0.5rem
    border-radius: 3px
    font-size: 0.9em

    &:focus
      outline: none
      border-color: var(--dnd5e-color-gold, #b59e54)

  select.form-input
    cursor: pointer

  .spell-drop-zone
    flex: 1
    border: 2px dashed #555
    border-radius: 6px
    padding: 0.5rem
    min-height: 200px
    transition: border-color 0.2s, background 0.2s

    &.drag-active
      border-color: var(--dnd5e-color-gold, #b59e54)
      background: rgba(66, 109, 190, 0.1)

  .drop-placeholder
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    height: 100%
    min-height: 180px
    color: #666

    i
      font-size: 2.5rem
      margin-bottom: 0.75rem

    p
      font-size: 0.9em
      font-style: italic

    &.active
      color: var(--dnd5e-color-gold, #b59e54)

  .spell-row
    display: flex
    align-items: center
    padding: 0.35rem 0.5rem
    border: 1px solid #555
    border-radius: 4px
    margin-bottom: 0.25rem
    background: rgba(255, 255, 255, 0.03)
    position: relative

    &:hover
      background: rgba(255, 255, 255, 0.06)

  .spell-icon-wrap
    flex: 0 0 auto
    margin-right: 0.5rem

  .spell-icon
    width: 32px
    height: 32px
    border-radius: 4px
    border: 1px solid var(--dnd5e-color-gold, #b59e54)
    object-fit: cover

  .spell-info
    flex: 1
    min-width: 0

  .spell-name
    font-weight: 600
    font-size: 0.9em

  .spell-meta
    display: flex
    gap: 0.35rem
    margin-top: 0.15rem

  .spell-badge
    font-size: 0.75em
    background: rgba(255, 255, 255, 0.08)
    padding: 0.1rem 0.35rem
    border-radius: 3px
    color: #ccc

  .spell-actions
    flex: 0 0 auto
    margin-left: 0.5rem

  .remove-btn
    background: none
    border: none
    color: #888
    cursor: pointer
    padding: 0.25rem
    border-radius: 3px
    line-height: 1

    &:hover
      color: #cc4444
      background: rgba(200, 0, 0, 0.15)

  .no-selection
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    height: 100%
    color: #666

    i
      font-size: 2rem
      margin-bottom: 0.75rem

    p
      font-size: 0.9em
      font-style: italic

  .slm-footer
    display: flex
    justify-content: flex-end
    gap: 0.5rem
    padding: 0.6rem 0.75rem
    border-top: 1px solid #666
    background: #222
    position: sticky
    bottom: 0
    z-index: 2

    .save-btn
      background: #1a4d1a
      border-color: #2a6d2a

      &:hover
        background: #2a6d2a
</style>