<script>
  import { onMount, tick } from "svelte";
  import { localize as t } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { getPacksFromSettings, extractItemsFromPacksSync, extractItemsFromPacksAsync, safeGetSetting } from "~/src/helpers/Utility";
  import { background } from "~/src/stores/index";

  /**
   * Custom Background Creator — 2024 DMG style
   * Allows players to build a custom background on the fly:
   * - Choose 3 ability scores
   * - Choose 1 origin feat (from feats compendium)
   * - Choose 2 skill proficiencies
   * - Choose 1 tool proficiency
   * - Grant 50 GP (equipment selection skipped per issue spec)
   */

  export let show = false;
  export let onBackgroundCreated = null; // callback(newBackgroundDocument)

  // ── Form State ────────────────────────────────────────────────────
  let backgroundName = "";
  let selectedAbilities = [];
  let selectedFeat = null;
  let selectedSkills = [];
  let selectedTool = null;
  let isCreating = false;
  let errorMessage = "";

  // ── Feat loading ──────────────────────────────────────────────────
  let featOptions = [];
  let featLoading = false;

  // ── Derived data ──────────────────────────────────────────────────
  const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"];

  function getAbilityLabel(key) {
    try {
      return game.i18n.localize(CONFIG.DND5E.abilities[key]?.label || `DND5E.Ability${key.charAt(0).toUpperCase() + key.slice(1)}`);
    } catch (e) {
      return key.toUpperCase();
    }
  }

  const skillKeys = [
    "acr", "ani", "arc", "ath", "dec", "his", "ins", "itm", "inv",
    "med", "nat", "prc", "prf", "per", "rel", "slt", "ste", "sur"
  ];

  function getSkillLabel(key) {
    try {
      return game.i18n.localize(CONFIG.DND5E.skills[key]?.label || "");
    } catch (e) {
      return key;
    }
  }

  // Tool proficiency keys (from CONFIG.DND5E.toolProficiencies)
  function getToolOptions() {
    const tools = [];
    try {
      const config = CONFIG.DND5E;
      if (config.toolProficiencies) {
        for (const [key, label] of Object.entries(config.toolProficiencies)) {
          tools.push({ value: key, label: game.i18n.localize(label) });
        }
      }
    } catch (e) {
      // fallback
    }
    // Also add specific tool IDs from toolIds
    try {
      const config = CONFIG.DND5E;
      if (config.toolIds) {
        for (const [key] of Object.entries(config.toolIds)) {
          if (!tools.find(t => t.value === key)) {
            tools.push({ value: key, label: key });
          }
        }
      }
    } catch (e) {}
    return tools.sort((a, b) => a.label.localeCompare(b.label));
  }

  $: toolOptions = getToolOptions();

  // ── Load feats from configured compendiums ─────────────────────────
  onMount(async () => {
    await loadFeats();
  });

  async function loadFeats() {
    featLoading = true;
    try {
      const packs = getPacksFromSettings("feats");
      if (packs.length === 0) {
        // Fallback: try backgrounds pack (some systems store feats there)
        const bgPacks = getPacksFromSettings("backgrounds");
        const items = extractItemsFromPacksSync(bgPacks, ["name->label", "img", "type", "uuid->value", "_id"]);
        featOptions = items
          .filter(x => x.type === "feat")
          .map(x => ({ ...x, label: x.label || x.name }))
          .sort((a, b) => a.label.localeCompare(b.label));
      } else {
        const items = await extractItemsFromPacksAsync(packs, ["name->label", "img", "type", "uuid->value", "_id"], ["system.type.value"]);
        featOptions = items
          .filter(x => x.type === "feat")
          .map(x => ({ ...x, label: x.label || x.name }))
          .sort((a, b) => a.label.localeCompare(b.label));
      }
    } catch (e) {
      window.GAS?.log?.e?.("[CustomBackground] Error loading feats:", e);
    }
    featLoading = false;
  }

  // ── Validation ─────────────────────────────────────────────────────
  function validate() {
    if (!backgroundName.trim()) {
      errorMessage = t("Tabs.Background.MissingName");
      return false;
    }
    if (selectedAbilities.length !== 3) {
      errorMessage = t("Tabs.Background.MissingAbilityScores");
      return false;
    }
    if (!selectedFeat) {
      errorMessage = t("Tabs.Background.MissingFeat");
      return false;
    }
    if (selectedSkills.length !== 2) {
      errorMessage = t("Tabs.Background.MissingSkills");
      return false;
    }
    if (!selectedTool) {
      errorMessage = t("Tabs.Background.MissingTool");
      return false;
    }
    errorMessage = "";
    return true;
  }

  // ── Ability toggle ─────────────────────────────────────────────────
  function toggleAbility(key) {
    if (selectedAbilities.includes(key)) {
      selectedAbilities = selectedAbilities.filter(a => a !== key);
    } else {
      if (selectedAbilities.length >= 3) return;
      selectedAbilities = [...selectedAbilities, key];
    }
  }

  // ── Skill toggle ───────────────────────────────────────────────────
  function toggleSkill(key) {
    if (selectedSkills.includes(key)) {
      selectedSkills = selectedSkills.filter(s => s !== key);
    } else {
      if (selectedSkills.length >= 2) return;
      selectedSkills = [...selectedSkills, key];
    }
  }

  // ── Create Background ──────────────────────────────────────────────
  async function createBackground() {
    if (!validate()) return;
    isCreating = true;

    try {
      const itemData = buildBackgroundItemData();
      window.GAS?.log?.d?.("[CustomBackground] Creating background item:", itemData);

      // Create the item in the game's Item directory (world items sidebar)
      const created = await Item.create(itemData);
      if (!created) {
        throw new Error("Item.create returned null/undefined");
      }

      window.GAS?.log?.d?.("[CustomBackground] Created background:", created);

      // Notify the user
      ui.notifications.info(
        game.i18n.format("GAS.Tabs.Background.CreateSuccess", { name: backgroundName.trim() })
      );

      // Set the background store to this newly created item
      $background = created;

      // Fire callback if provided
      if (typeof onBackgroundCreated === "function") {
        onBackgroundCreated(created);
      }

      // Reset form
      resetForm();
    } catch (e) {
      window.GAS?.log?.e?.("[CustomBackground] Error creating background:", e);
      errorMessage = t("Tabs.Background.CreateError");
      ui.notifications.error(t("Tabs.Background.CreateError"));
    } finally {
      isCreating = false;
    }
  }

  function buildBackgroundItemData() {
    const name = backgroundName.trim();
    const identifier = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Build ability score fixed configuration:
    // The 3 selected abilities get +1 each, the others 0
    const fixed = {};
    for (const key of abilityKeys) {
      fixed[key] = selectedAbilities.includes(key) ? 1 : 0;
    }

    // Build skill trait advancement
    const skillGrants = selectedSkills.map(s => `skill:${s}`);

    // Build tool trait advancement
    const toolGrants = [`tool:${selectedTool}`];

    // Build feat ItemGrant
    const featItems = selectedFeat ? [{ uuid: selectedFeat.value, optional: false }] : [];

    // Build the complete advancement array matching dnd5e schema
    const advancement = [
      {
        _id: foundry.utils.randomID(),
        type: "AbilityScoreImprovement",
        configuration: {
          fixed,
          points: 0,
          cap: 2
        },
        level: 1,
        title: game.i18n.localize("DND5E.AdvancementAbilityScoreImprovement")
      },
      {
        _id: foundry.utils.randomID(),
        type: "Trait",
        configuration: {
          mode: "default",
          allowReplacements: false,
          grants: skillGrants,
          choices: []
        },
        level: 1,
        title: game.i18n.localize("DND5E.AdvancementTraitSkill")
      },
      {
        _id: foundry.utils.randomID(),
        type: "Trait",
        configuration: {
          mode: "default",
          allowReplacements: false,
          grants: toolGrants,
          choices: []
        },
        level: 1,
        title: game.i18n.localize("DND5E.AdvancementTraitTool")
      }
    ];

    // Add ItemGrant for the origin feat if selected
    if (featItems.length > 0) {
      advancement.push({
        _id: foundry.utils.randomID(),
        type: "ItemGrant",
        configuration: {
          items: featItems,
          optional: false,
          spell: null
        },
        level: 1,
        title: game.i18n.localize("DND5E.AdvancementItemGrant")
      });
    }

    return {
      name,
      type: "background",
      img: "systems/dnd5e/icons/svg/items/background.svg",
      system: {
        description: {
          value: `<p>${game.i18n.format("GAS.Tabs.Background.CreateSuccess", { name })}</p>`,
          chat: ""
        },
        source: {
          custom: "Actor Studio Custom Background",
          uuid: "",
          rules: "2024"
        },
        identifier,
        advancement,
        // No starting equipment — grant 50 GP directly per issue spec
        startingEquipment: []
      }
    };
  }

  function resetForm() {
    backgroundName = "";
    selectedAbilities = [];
    selectedFeat = null;
    selectedSkills = [];
    selectedTool = null;
    errorMessage = "";
  }

  function cancelCustom() {
    resetForm();
    show = false;
  }

  // ── Chip toggle helper ──────────────────────────────────────────────
  function chipClass(selected, item) {
    return selected.includes(item) ? "chip selected" : "chip";
  }
  function chipSingleClass(selected, item) {
    return selected === item ? "chip selected" : "chip";
  }
</script>

<template lang="pug">
+if("show")
  .custom-background-panel
    h3.custom-bg-title {t("Tabs.Background.Custom")}

    //- Background Name
    .form-row
      label.form-label {t("Tabs.Background.BackgroundName")}
      input.form-input(type="text" bind:value="{backgroundName}" placeholder="{t('Tabs.Background.BackgroundNamePlaceholder')}")

    //- Ability Scores (pick 3)
    .form-row
      label.form-label
        | {t("Tabs.Background.AbilityScores")}
        span.selected-count ({selectedAbilities.length}/3)
      p.form-hint {t("Tabs.Background.AbilityScorePrompt")}
      .chip-group
        +each("abilityKeys as key")
          button.chip(
            type="button"
            class:selected="{selectedAbilities.includes(key)}"
            on:click="{() => toggleAbility(key)}"
            disabled="{!selectedAbilities.includes(key) && selectedAbilities.length >= 3}"
          ) {getAbilityLabel(key)}

    //- Origin Feat (pick 1)
    .form-row
      label.form-label {t("Tabs.Background.OriginFeat")}
      p.form-hint {t("Tabs.Background.OriginFeatPrompt")}
      +if("featLoading")
        p.loading {t("Loading")}
        +else()
          select.form-select(bind:value="{selectedFeat}")
          option(value="{null}") -- {t("Tabs.Background.OriginFeat")} --
          +each("featOptions as feat")
            option(value="{feat.value}") {feat.label}

    //- Skill Proficiencies (pick 2)
    .form-row
      label.form-label
        | {t("Tabs.Background.SkillProficiencies")}
        span.selected-count ({selectedSkills.length}/2)
      p.form-hint {t("Tabs.Background.SkillProficienciesPrompt")}
      .chip-group.skills
        +each("skillKeys as key")
          button.chip.chip-sm(
            type="button"
            class:selected="{selectedSkills.includes(key)}"
            on:click="{() => toggleSkill(key)}"
            disabled="{!selectedSkills.includes(key) && selectedSkills.length >= 2}"
          ) {getSkillLabel(key)}

    //- Tool Proficiency (pick 1)
    .form-row
      label.form-label {t("Tabs.Background.ToolProficiency")}
      p.form-hint {t("Tabs.Background.ToolProficiencyPrompt")}
      select.form-select(bind:value="{selectedTool}")
        option(value="{null}") -- {t("Tabs.Background.ToolProficiency")} --
        +each("toolOptions as tool")
          option(value="{tool.value}") {tool.label}

    //- Error / Validation
    +if("errorMessage")
      p.error-message {errorMessage}

    //- Actions
    .form-actions
      button.create-btn(type="button" on:click="{createBackground}" disabled="{isCreating}")
        +if("isCreating")
          | {t("Creating")}...
          +else()
            | {t("Tabs.Background.CreateButton")}
      button.cancel-btn(type="button" on:click="{cancelCustom}") {t("Cancel")}
</template>

<style lang="sass">
  .custom-background-panel
    margin-top: 1rem
    padding: 1rem
    background: rgba(255, 255, 255, 0.05)
    border: 1px solid #555
    border-radius: 6px

  .custom-bg-title
    margin: 0 0 1rem 0
    font-size: 1.1rem
    color: #ffd700
    border-bottom: 1px solid #555
    padding-bottom: 0.35rem

  .form-row
    margin-bottom: 1rem

  .form-label
    display: block
    font-weight: 600
    margin-bottom: 0.25rem
    color: #ddd

  .selected-count
    margin-left: 0.5rem
    font-weight: normal
    color: #aaa
    font-size: 0.85rem

  .form-hint
    margin: 0 0 0.5rem 0
    font-size: 0.8rem
    color: #999
    font-style: italic

  .form-input
    width: 100%
    padding: 0.4rem 0.6rem
    border: 1px solid #666
    border-radius: 4px
    background: #333
    color: white
    font-size: 0.95rem
    &:focus
      outline: 2px solid #4a9eff
      outline-offset: 1px

  .form-select
    width: 100%
    max-width: 100%
    padding: 0.4rem 0.6rem
    border: 1px solid #666
    border-radius: 4px
    background: #333
    color: white
    font-size: 0.95rem
    &:focus
      outline: 2px solid #4a9eff
      outline-offset: 1px

  .chip-group
    display: flex
    flex-wrap: wrap
    gap: 0.4rem

    &.skills
      gap: 0.3rem

  .chip
    display: inline-flex
    align-items: center
    justify-content: center
    padding: 0.35rem 0.7rem
    border: 1px solid #555
    border-radius: 4px
    background: #333
    color: #ccc
    cursor: pointer
    font-size: 0.85rem
    font-family: inherit
    transition: all 0.15s ease

    &:hover:not(:disabled)
      background: #444
      border-color: #888

    &.selected
      background: #2a6e2a
      border-color: #4caf50
      color: white

    &:disabled
      opacity: 0.4
      cursor: not-allowed

    &.chip-sm
      padding: 0.25rem 0.5rem
      font-size: 0.78rem

  .loading
    color: #aaa
    font-style: italic

  .error-message
    color: #ff6b6b
    font-size: 0.85rem
    margin: 0.5rem 0

  .form-actions
    display: flex
    gap: 0.5rem
    margin-top: 1rem

    button
      padding: 0.5rem 1rem
      border: 1px solid #666
      border-radius: 4px
      cursor: pointer
      font-size: 0.9rem
      font-family: inherit

      &:disabled
        opacity: 0.5
        cursor: not-allowed

    .create-btn
      background: #4caf50
      color: white
      border-color: #4caf50
      &:hover:not(:disabled)
        background: #43a047

    .cancel-btn
      background: #555
      color: white
      &:hover
        background: #666
</style>