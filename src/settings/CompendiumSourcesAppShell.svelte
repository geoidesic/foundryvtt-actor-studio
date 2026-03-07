<svelte:options accessors={true} />

<script>
  import { getContext } from 'svelte';
  import { TJSApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { TJSDialog } from '@typhonjs-fvtt/runtime/svelte/application';
  import { Timing } from '@typhonjs-fvtt/runtime/util';
  import { MODULE_ID, DEFAULT_SOURCES } from '~/src/helpers/constants';
  import { safeGetSetting } from '~/src/helpers/Utility';

  export let elementRoot;

  const { application } = getContext('#external');
  let appDraggable = application.reactive.draggable;
  appDraggable = true;
  $: application.reactive.draggable = appDraggable;

  // Application position store reference
  const position = application.position;

  // Debounced callback to serialize position after 500ms
  const storePosition = Timing.debounce(() => {}, 500);

  // Reactive statement to invoke debounce on position changes
  $: storePosition($position);

  // Core data
  let baseCompendiumList = game.packs.filter((p) => p.documentName === 'Item');
  let filterEnabled = safeGetSetting(MODULE_ID, 'filterPackSourcesAppropriatelyByName', false);
  let selectedSources = safeGetSetting(MODULE_ID, 'compendiumSources', DEFAULT_SOURCES);
  let searchText = '';
  let showAllExpanded = true;
  let showOnlySelected = true;

  // Build source categories (races, classes, etc.)
  const sourceCategories = [
    { key: 'races', label: game.i18n.localize('GAS.Setting.Sources.RaceCompendia'), inclusions: ['race'], exclusions: [] },
    { key: 'classes', label: game.i18n.localize('GAS.Setting.Sources.ClassCompendia'), inclusions: ['class'], exclusions: ['subclass'] },
    { key: 'subclasses', label: game.i18n.localize('GAS.Setting.Sources.SubclassCompendia'), inclusions: ['subclass'], exclusions: [] },
    { key: 'backgrounds', label: game.i18n.localize('GAS.Setting.Sources.BackgroundCompendia'), inclusions: ['background'], exclusions: [] },
    { key: 'equipment', label: game.i18n.localize('GAS.Setting.Sources.EquipmentCompendia'), inclusions: ['item', 'equipment'], exclusions: [] },
    { key: 'spells', label: game.i18n.localize('GAS.Setting.Sources.SpellCompendia'), inclusions: ['spell'], exclusions: [] },
    { key: 'feats', label: game.i18n.localize('GAS.Setting.Sources.FeatCompendia'), inclusions: ['feat'], exclusions: [] }
  ];

  // Build filteredData structure
  $: filteredData = sourceCategories.map((category) => ({
    key: category.key,
    label: category.label,
    compendia: buildCompendiaList(
      baseCompendiumList,
      selectedSources,
      category.key,
      category.inclusions,
      category.exclusions
    )
  }));

  function buildCompendiaList(compendiaList, selections, storageKey, inclusions = [], exclusions = []) {
    let list = compendiaList;

    if (filterEnabled) {
      list = list.filter((pack) => {
        const meta = pack.metadata;
        const searchFields = [meta.id, meta.name, meta.path, meta.label].map((s) => s.toLowerCase());

        const hasMatch = inclusions.some((inc) =>
          searchFields.some((field) => field.includes(inc.toLowerCase()))
        );
        const hasExclusion = exclusions.some((exc) =>
          searchFields.some((field) => field.includes(exc.toLowerCase()))
        );

        return hasMatch && !hasExclusion;
      });
    }

    return list.map((p) => ({
      collection: p.collection,
      label: `${p.metadata.label} [${p.metadata.packageName}]`,
      checked: selections[storageKey]?.includes(p.collection) ?? false
    }));
  }

  // Apply search and visibility filter
  $: visibleCategories = filteredData.map((cat) => {
    const searchLower = searchText.toLowerCase().trim();
    const visibleCompendia = cat.compendia.filter((comp) => {
      // Apply search filter
      if (searchLower) {
        const matchesSearch = comp.label.toLowerCase().includes(searchLower) || comp.collection.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Apply "Show Selected" filter
      if (showOnlySelected && !comp.checked) {
        return false;
      }
      
      return true;
    });
    
    return {
      ...cat,
      compendia: visibleCompendia,
      visible: visibleCompendia.length > 0
    };
  });

  function handleResetDefaults() {
    selectedSources = foundry.utils.deepClone(DEFAULT_SOURCES);
  }

  function handleCheckboxChange(categoryKey, collection, checked) {
    if (!selectedSources[categoryKey]) selectedSources[categoryKey] = [];

    if (checked) {
      if (!selectedSources[categoryKey].includes(collection)) {
        selectedSources[categoryKey].push(collection);
      }
    } else {
      selectedSources[categoryKey] = selectedSources[categoryKey].filter((c) => c !== collection);
    }

    selectedSources = selectedSources;
  }

  function handleCancel() {
    application.close();
  }

  async function handleSave() {
    await game.settings.set(MODULE_ID, 'compendiumSources', selectedSources);
    
    const result = await TJSDialog.confirm({
      title: game.i18n.localize('GAS.Dialog.ReloadRequiredTitle'),
      content: `<p>${game.i18n.localize('GAS.Dialog.ReloadRequiredContent')}</p>`,
      defaultYes: true
    });

    if (result) {
      window.location.reload();
    } else {
      application.close();
    }
  }
</script>

<TJSApplicationShell bind:elementRoot>
  <main class="compendium-sources-settings">
    <header class="gas-sources-toolbar">
      <label class="search-box no-drag">
        <i class="fas fa-search"></i>
        <input
          class="no-drag"
          type="search"
          bind:value={searchText}
          placeholder="Search compendiums..."
        />
      </label>
      
      <label class="toggle-control no-drag">
        <input class="no-drag" type="checkbox" bind:checked={showOnlySelected} />
        <span class="no-drag">Show Selected Only</span>
      </label>
      
      <label class="toggle-control no-drag">
        <input class="no-drag" type="checkbox" bind:checked={showAllExpanded} />
        <span class="no-drag">Expand All</span>
      </label>
      
      <button type="button" class="reset-button no-drag" on:click={handleResetDefaults}>
        <i class="fas fa-undo"></i> Reset
      </button>
    </header>

    <section class="sources-content">
      {#each visibleCategories as category}
        {#if category.visible}
          <details class="source-section" open={showAllExpanded}>
            <summary class="source-summary">{category.label}</summary>
            <div class="source-list">
              {#each category.compendia as comp}
                <label class="source-row">
                  <input
                    type="checkbox"
                    checked={comp.checked}
                    on:change={(e) => handleCheckboxChange(category.key, comp.collection, e.target.checked)}
                  />
                  <span>{comp.label}</span>
                </label>
              {/each}
            </div>
          </details>
        {/if}
      {/each}
    </section>

    <footer class="sources-footer">
      <button type="button" on:click={handleCancel}>Cancel</button>
      <button type="button" class="save-button" on:click={handleSave}>
        {game.i18n.localize('GAS.Setting.Sources.Save')}
      </button>
    </footer>
  </main>
</TJSApplicationShell>

<style lang="sass">
  :root
    --tjs-sources-bg: rgba(0, 0, 0, 0.9)
    --tjs-sources-text: white
    --tjs-sources-border: #666

  :global(#gas-compendium-sources-settings)
    background-color: var(--tjs-sources-bg)
    color: var(--tjs-sources-text)

  :global(#gas-compendium-sources-settings .window-content)
    padding: 0
    overflow: hidden

  .compendium-sources-settings
    display: flex
    flex-direction: column
    height: 100%
    padding: 0
    color: var(--tjs-sources-text)
    background-color: var(--tjs-sources-bg)

  .gas-sources-toolbar
    display: flex
    align-items: center
    gap: 0.75rem
    position: sticky
    top: 0
    z-index: 2
    background: var(--color-bg-option, #222)
    border-bottom: 1px solid var(--tjs-sources-border)
    padding: 0.5rem 0.75rem

  .search-box
    flex: 1
    display: flex
    align-items: center
    gap: 0.5rem
    margin: 0
    min-width: 200px

    i
      color: #999

    input
      width: 100%
      background: #333
      border: 1px solid var(--tjs-sources-border)
      color: var(--tjs-sources-text)
      padding: 0.3rem 0.5rem
      border-radius: 3px
      font-size: 0.95em

  .toggle-control
    display: flex
    align-items: center
    gap: 0.4rem
    margin: 0
    cursor: pointer
    white-space: nowrap
    font-size: 0.9em

    input[type="checkbox"]
      cursor: pointer
      margin: 0

    span
      user-select: none

  .reset-button
    margin: 0
    white-space: nowrap
    background: #444
    border: 1px solid var(--tjs-sources-border)
    color: var(--tjs-sources-text)
    padding: 0.3rem 0.7rem
    border-radius: 3px
    cursor: pointer
    font-size: 0.9em

    i
      margin-right: 0.3rem

    &:hover
      background: #555

  .sources-content
    flex: 1
    overflow: auto
    padding: 0.75rem
    display: flex
    flex-direction: column
    gap: 0.5rem

  .source-section
    border: 1px solid var(--tjs-sources-border)
    border-radius: 6px
    background: rgba(255, 255, 255, 0.05)
    padding: 0.25rem 0.5rem 0.5rem

  .source-summary
    cursor: pointer
    font-weight: 700
    line-height: 1.6
    color: var(--tjs-sources-text)

  .source-list
    display: flex
    flex-direction: column
    gap: 0.35rem
    margin-top: 0.35rem

  .source-row
    display: flex
    align-items: flex-start
    gap: 0.5rem
    color: var(--tjs-sources-text)

    input[type="checkbox"]
      margin-top: 0.15rem

  .sources-footer
    position: sticky
    bottom: 0
    z-index: 2
    display: flex
    justify-content: flex-end
    align-items: center
    gap: 0.5rem
    padding: 0.75rem
    padding-right: 1.25rem
    border-top: 1px solid var(--tjs-sources-border)
    background: var(--color-bg-option, #222)
    pointer-events: none

    button
      background: #444
      border: 1px solid var(--tjs-sources-border)
      color: var(--tjs-sources-text)
      padding: 0.4rem 1rem
      border-radius: 3px
      cursor: pointer
      margin: 0
      pointer-events: auto

      &:hover
        background: #555

    .save-button
      min-width: 9rem
      background: #1a4d1a
      border-color: #2a6d2a

      &:hover
        background: #2a6d2a
</style>
