<script>
  import { TJSDialog } from "@typhonjs-fvtt/runtime/svelte/application";
  import { getContext } from "svelte";
  import { CRCalculator } from "~/src/helpers/CRCalculator.js";
  import { ucfirst, getItemsArray, updateSource, dnd5eModCalc, normalizeList, SIZES, pbForCR, xpForCR, skillBonus, localize as t } from "~/src/helpers/Utility";
  import { selectedTargetCR } from "~/src/stores/selectedTargetCR.js";
  import { ensureNumberCR } from "~/src/lib/cr.js";
  import AttributeScore from "~/src/components/atoms/dnd5e/NPC/AttributeScore.svelte";
  import ArmorClass from "~/src/components/atoms/dnd5e/NPC/ArmorClass.svelte";
  import HitPoints from "~/src/components/atoms/dnd5e/NPC/HitPoints.svelte";
  import Speed from "~/src/components/atoms/dnd5e/NPC/Speed.svelte";
  import Skills from "~/src/components/atoms/dnd5e/NPC/Skills.svelte";
  import Senses from "~/src/components/atoms/dnd5e/NPC/Senses.svelte";
  import Languages from "~/src/components/atoms/dnd5e/NPC/Languages.svelte";
  import SavingThrows from "~/src/components/atoms/dnd5e/NPC/SavingThrows.svelte";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import EditableValue from "~/src/components/atoms/EditableValue.svelte";
  import CRCalculatorDialog from "~/src/components/molecules/dnd5e/NPC/CRCalculatorDialog.svelte";
  export let name;
  export let readonly = true; // Default to readonly for backward compatibility
  export let includeRollButtons = false;
  export let enableCrCalculator = false; // guard for CR calculator UI

  const actor = getContext("#doc");
  $: npc = $actor;

  // State for inline editing
  let editingSize = false;
  let editingType = false;
  let editingAlignment = false;
  let editingName = false;
  let currentCRBreakdown = null;

  const abilityOrder = ["str","dex","con","int","wis","cha"];
  
  // D&D 5e size options
  const sizeOptions = [
    { value: 'tiny', label: 'Tiny' },
    { value: 'sm', label: 'Small' },
    { value: 'med', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'huge', label: 'Huge' },
    { value: 'grg', label: 'Gargantuan' }
  ];
  
  // D&D 5e creature type options
  const creatureTypeOptions = [
    { value: 'dragon', label: 'Dragon' },
    { value: 'elemental', label: 'Elemental' },
    { value: 'fey', label: 'Fey' },
    { value: 'fiend', label: 'Fiend' },
    { value: 'giant', label: 'Giant' },
    { value: 'humanoid', label: 'Humanoid' },
    { value: 'monstrosity', label: 'Monstrosity' },
    { value: 'ooze', label: 'Ooze' },
    { value: 'plant', label: 'Plant' },
    { value: 'undead', label: 'Undead' }
  ];
  
  // D&D 5e alignment options
  const alignmentOptions = [
    { value: 'Lawful Good', label: 'Lawful Good' },
    { value: 'Neutral Good', label: 'Neutral Good' },
    { value: 'Chaotic Good', label: 'Chaotic Good' },
    { value: 'Lawful Neutral', label: 'Lawful Neutral' },
    { value: 'Neutral', label: 'Neutral' },
    { value: 'Chaotic Neutral', label: 'Chaotic Neutral' },
    { value: 'Lawful Evil', label: 'Lawful Evil' },
    { value: 'Neutral Evil', label: 'Neutral Evil' },
    { value: 'Chaotic Evil', label: 'Chaotic Evil' },
    { value: 'Unaligned', label: 'Unaligned' }
  ];

  // pbForCR now imported from Utility

  // xpForCR now imported from Utility

  // normalizeList now imported from Utility

  // Saving throws - now handled by the SavingThrows component
  // $: savingThrowsList = abilityOrder
  //   .filter(abbr => npc?.system?.abilities?.[abbr]?.proficient)
  //   .map(abbr => {
  //     const score = npc?.system?.abilities?.[abbr]?.value ?? 10;
  //     const mod = abilityMod(score);
  //     const save = mod + pbForCR(npc?.system?.details?.cr ?? 0);
  //     return `${abilityLabel[abbr] || abbr.toUpperCase()} ${formatBonus(save)}`;
  //   });

  $: abilityScores = abilityOrder.map(abbr => ({
    abbr: abbr.toUpperCase(),
    score: npc?.system?.abilities?.[abbr]?.value ?? 10
  }));


  // Skills
  const skillToLabel = {
    acr: 'Acrobatics', ani: 'Animal Handling', arc: 'Arcana', ath: 'Athletics', dec: 'Deception',
    his: 'History', ins: 'Insight', itm: 'Intimidation', inv: 'Investigation', med: 'Medicine',
    nat: 'Nature', prc: 'Perception', prf: 'Performance', per: 'Persuasion', rel: 'Religion',
    slt: 'Sleight of Hand', ste: 'Stealth', sur: 'Survival'
  };


  $: skillsList = Object.keys(npc?.system?.skills || {})
    .filter(k => (npc?.system?.skills?.[k]?.value || 0) > 0)
    .map(k => `${skillToLabel[k] || k} ${CRCalculator.formatBonus(skillBonus(k))}`);

  // Senses & passive perception
  function senseEntries() {
    const s = npc?.system?.attributes?.senses || {};
    const parts = [];
    if (s.blindsight) parts.push(`blindsight ${s.blindsight} ft.`);
    if (s.darkvision) parts.push(`darkvision ${s.darkvision} ft.`);
    if (s.tremorsense) parts.push(`tremorsense ${s.tremorsense} ft.`);
    if (s.truesight) parts.push(`truesight ${s.truesight} ft.`);
    return parts.join(', ');
  }

  // Traits
  $: di = normalizeList(npc?.system?.traits?.di?.value).join(', ');
  $: dr = normalizeList(npc?.system?.traits?.dr?.value).join(', ');
  $: dv = normalizeList(npc?.system?.traits?.dv?.value).join(', ');
  $: ci = normalizeList(npc?.system?.traits?.ci?.value).join(', ');

  // Languages - now handled by the Languages component
  // $: languages = (() => {
  //   const vals = normalizeList(npc?.system?.traits?.languages?.value);
  //   const custom = npc?.system?.traits?.languages?.custom || '';
  //   return [vals.join(', '), custom].filter(Boolean).join(', ');
  // })();

  // PB / XP
  $: cr = ensureNumberCR(npc?.system?.details?.cr ?? 0, 0);
  $: pb = pbForCR(cr);
  $: xp = xpForCR(cr);
  
  // Challenge Rating and XP for editing
  $: crValue = ensureNumberCR(npc?.system?.details?.cr ?? 0, 0);
  $: xpValue = npc?.system?.details?.xp?.value ?? xpForCR(crValue);

  // Simple trait summaries (from resources)
  $: legendaryResistances = (() => {
    const val = npc?.system?.resources?.legres?.value;
    return val && Number(val) > 0 ? `Legendary Resistance (${val}/Day)` : '';
  })();

  // Enrich HTML for tooltips using Utility.enrichHTML (cached)
  import { enrichHTML } from "~/src/helpers/Utility";
  const tooltipCache = new Map();
  function getItemKey(item) { return item?.uuid || item?._id || item?.id || item?.name; }
  async function ensureTooltip(item) {
    const key = getItemKey(item);
    if (!key || tooltipCache.has(key)) return;
    try {
      const raw = item?.system?.description?.value || '';
      const html = await enrichHTML(raw, { async: true });
      tooltipCache.set(key, html);
    } catch (_) {
      // fallback to raw description
      tooltipCache.set(key, item?.system?.description?.value || '');
    }
  }
  function getTooltip(item) { return tooltipCache.get(getItemKey(item)) || ''; }

  // Enriched name links (anchor that Foundry auto-tooltips)
  const nameHtmlCache = new Map();
  async function ensureNameHtml(item) {
    const key = `name:${getItemKey(item)}`;
    if (!key || nameHtmlCache.has(key)) return;
    try {
      const inline = item?.enrichedName || (item?.uuid ? `@UUID[${item.uuid}]{${item.name}}` : item?.name || '');
      const html = await enrichHTML(inline, { async: true });
      nameHtmlCache.set(key, html);
    } catch (_) {
      nameHtmlCache.set(key, item?.name || '');
    }
  }
  function getNameHtml(item) { return nameHtmlCache.get(`name:${getItemKey(item)}`) || (item?.name || ''); }

  $: itemsArray = getItemsArray(npc?.items);
  $: (async () => { for (const it of itemsArray) { await ensureTooltip(it); await ensureNameHtml(it); } })();

  $: legendaryActions = (() => {
    const items = itemsArray;
    const list = items.filter(i => i?.system?.activation?.type === 'legendary') || [];
    return list.map(i => {
      const cost = Number(i?.system?.activation?.cost) || 1;
      const name = i?.name || 'Legendary Action';
      const desc = i?.system?.description?.value || '';
      const costNote = cost > 1 ? ` (Costs ${cost} Actions)` : '';
      return { name, cost, item: i, desc, costNote };
    });
  })();

  // Helper functions for async updates
  async function updateActorName(value) {
    // Minimal logging for updates; errors still reported.
    try {
      await updateSource($actor, { name: value });
      // Update local npc for immediate UI reactivity
      if (npc) npc.name = value;
    } catch (error) {
      console.error('Failed to update actor name:', error?.message ?? error);
  }
  }

  async function updateActorSize(value) {
    try {
      await updateSource($actor, { 'system.traits.size': value });
    } catch (error) {
      console.error('Failed to update actor size:', error?.message ?? error);
    }
  }

  async function updateActorType(value) {
    try {
      await updateSource($actor, { 'system.details.type.value': value });
    } catch (error) {
      console.error('Failed to update actor type:', error?.message ?? error);
    }
  }

  async function updateActorAlignment(value) {
    try {
      await updateSource($actor, { 'system.details.alignment': value });
    } catch (error) {
      console.error('Failed to update actor alignment:', error?.message ?? error);
    }
  }



  async function updateActorSkills(skill, proficient, ability) {
    try {
      const updateData = {
        [`system.skills.${skill}.value`]: proficient
      };
      await updateSource($actor, updateData);
    } catch (error) {
      console.error('Failed to update actor skills:', error?.message ?? error);
    }
  }

  async function updateActorDamageResistances(value) {
    if ($actor) {
      try {
      await updateSource($actor, { 'system.traits.dr': value });
        // Also update the local npc object for reactivity
      } catch (error) {
        console.error('Failed to update actor damage resistances:', error);
      }
    }
  }

  async function updateActorDamageImmunities(value) {
    if ($actor) {
      try {
  await updateSource($actor, { 'system.traits.di': value });
        // Also update the local npc object for reactivity
      } catch (error) {
        console.error('Failed to update actor damage immunities:', error);
      }
    }
  }

  async function updateActorDamageVulnerabilities(value) {
    if ($actor) {
      try {
  await updateSource($actor, { 'system.traits.dv': value });
        // Also update the local npc object for reactivity
      } catch (error) {
        console.error('Failed to update actor damage vulnerabilities:', error);
      }
    }
  }

  async function updateActorConditionImmunities(value) {
    if ($actor) {
      try {
            await updateSource($actor, { 'system.traits.ci': value });
        // Also update the local npc object for reactivity
      } catch (error) {
        console.error('Failed to update actor condition immunities:', error);
      }
    }
  }

  async function updateActorSenses(sense, value) {
    try {
      const updateData = { [`system.attributes.senses.${sense}`]: value };
      await updateSource($actor, updateData);
    } catch (error) {
      console.error('Failed to update actor senses:', error?.message ?? error);
    }
  }


  async function updateActorLanguages(updateData) {
    console.log('🔍 updateActorLanguages called with:', updateData);
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update languages...');
      try {
        const { type, language, isCustom } = updateData;

        if (type === 'add') {
          if (isCustom) {
            // Add custom language - append to existing custom languages
            const currentCustom = npc?.system?.traits?.languages?.custom || '';
            const newCustom = currentCustom ? `${currentCustom}, ${language}` : language;
            await updateSource($actor, { 'system.traits.languages.custom': newCustom });
          } else {
            // Add standard language - append to existing value array
            const currentLanguages = npc?.system?.traits?.languages?.value || [];
            const newLanguages = [...currentLanguages, language];
            await updateSource($actor, { 'system.traits.languages.value': newLanguages });
          }
        } else if (type === 'remove') {
          if (isCustom) {
            // Remove custom language
            const currentCustom = npc?.system?.traits?.languages?.custom || '';
            const newCustom = currentCustom.split(',').filter(lang => lang.trim() !== language).join(', ').trim();
            await updateSource($actor, { 'system.traits.languages.custom': newCustom });
          } else {
            // Remove standard language
            const currentLanguages = npc?.system?.traits?.languages?.value || [];
            const newLanguages = currentLanguages.filter(lang => lang !== language);
            await updateSource($actor, { 'system.traits.languages.value': newLanguages });
          }
        }
        
        console.log('🎉 Languages update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor languages:', error);
        console.error('❌ Error stack:', error.stack);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }
  
  async function updateActorSavingThrows(updateData) {
    console.log('🔍 updateActorSavingThrows called with:', updateData);
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update saving throws...');
      try {
        const { type, ability } = updateData;
        
        if (type === 'add') {
          // Add saving throw proficiency
            await updateSource($actor, { [`system.abilities.${ability}.proficient`]: true });
        } else if (type === 'remove') {
          // Remove saving throw proficiency
            await updateSource($actor, { [`system.abilities.${ability}.proficient`]: false });
        }
        
        console.log('✅ Saving throws updated successfully');
      } catch (error) {
        console.error('❌ Failed to update actor saving throws:', error);
      }
    } else {
      console.log('❌ No actor found');
    }
  }

  function parseCRInput(val) {
    if (typeof val === 'number') return val;
    const s = String(val).trim();
    if (s.includes('/')) {
      const [a, b] = s.split('/').map(Number);
      if (a && b) return a / b;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : (npc?.system?.details?.cr ?? 0);
  }


  async function updateActorXP(value) {
    if ($actor) {
      try {
          await updateSource($actor, { 'system.details.xp.value': parseInt(value) || 200 });
        // Also update the local npc object for reactivity
      } catch (error) {
        console.error('Failed to update actor XP:', error);
      }
    }
  }



  async function updateActorProficiencyBonus(value) {
    if ($actor) {
      try {
          await updateSource($actor, { 'system.attributes.pb': parseInt(value) || 2 });
        // Also update the local npc object for reactivity
      } catch (error) {
        console.error('Failed to update actor proficiency bonus:', error);
      }
    }
  }

  async function updateActorLegendaryResistances(value) {
    if ($actor) {
      try {
          await updateSource($actor, { 'system.traits.legendaryResistances': value });
        // Also update the local npc object for reactivity
      } catch (error) {
        console.error('Failed to update actor legendary resistances:', error);
      }
    }
  }

  async function updateActorLegendaryActions(value) {
    if ($actor) {
      try {
          await updateSource($actor, { 'system.resources.legact.value': parseInt(value) || 3 });
        // Also update the local npc object for reactivity
      } catch (error) {
        console.error('Failed to update actor legendary actions:', error);
      }
    }
  }

  // Handle ability score updates from AttributeScore components
  async function updateActorAbilityScore(ability, value) {
    try {
      await updateSource($actor, { [`system.abilities.${ability}.value`]: value });
    } catch (error) {
      console.error('Failed to update actor ability score:', error?.message ?? error);
    }
  }

  // Handle HP updates from HitPoints component
  async function updateActorHP(type, value) {
    try {
      let updateData = {};
      if (type === 'max') {
        updateData = { 'system.attributes.hp.max': value, 'system.attributes.hp.value': value };
      } else if (type === 'formula') {
        updateData = { 'system.attributes.hp.formula': value };
      }
      await updateSource($actor, updateData);
    } catch (error) {
      console.error('Failed to update actor HP:', error?.message ?? error);
    }
  }

  // Handle Speed updates from Speed component
  async function updateActorSpeed(type, value) {
    try {
      await updateSource($actor, { [`system.attributes.movement.${type}`]: value });
    } catch (error) {
      console.error('Failed to update actor speed:', error?.message ?? error);
    }
  }

  // Handle AC updates from ArmorClass component
  async function updateActorAC(value) {
    try {
      await updateSource($actor, { 'system.attributes.ac.value': value });
    } catch (error) {
      console.error('Failed to update actor AC:', error?.message ?? error);
    }
  }


  async function openCRPrompt(title, props) {
    const result = await TJSDialog.prompt({
        title,
        draggable: true,
        minimizable: false,
        modal: true,
        label: 'Ok',
        onOk: () => 'OK',
        content: {
          class: CRCalculatorDialog,
          props: {
            defensive: props.defensive,
            offensive: props.offensive,
            initialCR: props.initialCR,
            xp: props.xp,
            pb: props.pb,
            hp: props.hp,
            hpMin: props.hpMin,
            hpMax: props.hpMax,
            ac: props.ac,
            expectedAC: props.expectedAC,
            acDiff: props.acDiff,
            dpr: props.dpr,
            dprMin: props.dprMin,
            dprMax: props.dprMax,
            highestAttack: props.highestAttack,
            expectedAttack: props.expectedAttack,
            highestSave: props.highestSave,
            expectedSave: props.expectedSave,
            attackDiff: props.attackDiff,
            saveDiff: props.saveDiff,
            finalRule: props.finalRule
          }
        },
      }, { classes: ['tjs-actor-studio', 'GAS'] });
  return result
  }
  async function openCRWait(title, props) {
    // Provide an initially-disabled Apply button in the dialog chrome.
    const result = await TJSDialog.wait({
        title,
        draggable: true,
        minimizable: false,
        modal: false,
        buttons: {
          apply: {
            label: 'Apply',
            icon: 'fas fa-check',
            disabled: true,
            autoClose: false,
            // Keep dialog open; perform apply and surface diffs via application.data
            onPress: async ({ application }) => {
              try {
                console.log('[CR Dialog] Apply button clicked - selectedTargetCR:', $selectedTargetCR);
                const value = ensureNumberCR($selectedTargetCR ?? props.calculatedCR ?? props.initialCR ?? 0, 0);
                console.log('[CR Dialog] Resolved target CR value:', value);
                const updates = CRCalculator.adjustActorToCR($actor, value) || {};
                if (!updates['system.details.cr']) updates['system.details.cr'] = value;
                if (!updates['system.details.xp.value']) updates['system.details.xp.value'] = props.xp ?? 0;
                // Capture previous values for Undo
                const previous = {};
                for (const path of Object.keys(updates)) {
                  previous[path] = getValueAt($actor, path);
                }
                console.log('[CR Dialog] Applying updates via updateSource:$actor, ', updates, 'previous:', previous);
                await updateSource($actor, updates);
                applyUpdatesToLocalNpc(updates);
                // Build a simple diff list for dialog presentation
                const diffs = Object.keys(updates).map(p => ({ path: p, from: previous[p], to: updates[p] }));
                // Persist the lastApplied for Undo
                lastApplied = { updates, previous };
                // Push the diffs into the dialog data so content can render them, and enable Undo button
                try { application?.data?.set?.('appliedChanges', diffs); } catch (_) {
                  // ignore
                }
                try { application?.data?.set?.('buttons.undo.disabled', false); } catch (_) {}
                // Recalculate breakdown after applying so dialog can show new calculated results
                try {
                  const newBreakdown = await CRCalculator.calculateCurrentCR($actor);
                  application?.data?.set?.('recalculatedBreakdown', newBreakdown);
                } catch (_) {}
                ui.notifications?.info?.(`Applied CR ${CRCalculator.formatCR(value)} (XP ${props.xp ?? 0}) to actor.`);
              } catch (err) {
                console.error('Failed to apply CR from dialog button callback:', err);
                ui.notifications?.error?.('Failed to apply calculated CR.');
              } finally {
                selectedTargetCR.set(null);
              }
            }
          },
          undo: {
            label: 'Undo',
            icon: 'fas fa-undo',
            disabled: true,
            autoClose: false,
            // Revert the last applied updates
            onPress: async ({ application }) => {
              try {
                if (!lastApplied) return false;
                const revert = lastApplied.previous || {};
                console.log('[CR Dialog] Undo clicked - reverting:', revert);
                await updateSource($actor, revert);
                applyUpdatesToLocalNpc(revert);
                // Clear dialog diffs and disable Undo
                try { application?.data?.set?.('appliedChanges', null); } catch (_) {}
                try { application?.data?.set?.('buttons.undo.disabled', true); } catch (_) {}
                // Recalculate breakdown after revert
                try {
                  const newBreakdown = await CRCalculator.calculateCurrentCR($actor);
                  application?.data?.set?.('recalculatedBreakdown', newBreakdown);
                } catch (_) {}
                ui.notifications?.info?.('Reverted last CR application.');
                lastApplied = null;
              } catch (err) {
                console.error('Failed to undo CR application:', err);
                ui.notifications?.error?.('Failed to undo CR application.');
              }
            }
          },
          cancel: {
            label: 'Cancel',
            icon: 'fas fa-times'
          }
        },
  content: {
          class: CRCalculatorDialog,
          props: {
            type: 'apply',
            defensive: props.defensive,
            offensive: props.offensive,
            initialCR: props.initialCR,
            calculatedCR: props.calculatedCR,
            xp: props.xp,
            pb: props.pb,
            hp: props.hp,
            hpMin: props.hpMin,
            hpMax: props.hpMax,
            ac: props.ac,
            expectedAC: props.expectedAC,
            acDiff: props.acDiff,
            dpr: props.dpr,
            dprMin: props.dprMin,
            dprMax: props.dprMax,
            highestAttack: props.highestAttack,
            expectedAttack: props.expectedAttack,
            highestSave: props.highestSave,
            expectedSave: props.expectedSave,
            attackDiff: props.attackDiff,
            saveDiff: props.saveDiff,
            finalRule: props.finalRule,
            onTargetCRChange: (selected) => { selectedTargetCR.set(selected); enableApplyButton(); }
          }
        },
  }, { classes: ['tjs-actor-studio', 'GAS'], data: { appliedChanges: null, recalculatedBreakdown: null, buttons: { undo: { disabled: true } } } });
  return result
  }

  function enableApplyButton() {
    // Find the most recent TJSDialog instance in the DOM and enable its apply button.
    try {
      const containers = Array.from(document.querySelectorAll('.tjs-actor-studio'));
      if (!containers.length) return;
      const container = containers[containers.length - 1];
      const applyBtn = container.querySelector('[data-action="apply"]');
      if (applyBtn) applyBtn.removeAttribute('disabled');
      else {
        // fallback: find a button with text 'Apply'
        const buttons = Array.from(container.querySelectorAll('button'));
        const btn = buttons.find(b => (b.textContent || '').trim() === 'Apply');
        if (btn) btn.removeAttribute('disabled');
      }
    } catch (err) {
      // ignore DOM errors
    }
  }

  // Apply updates object to local `npc` for reactivity after calling updateSource
  function applyUpdatesToLocalNpc(updates) {
    if (!npc || !updates) return;
    for (const [path, value] of Object.entries(updates)) {
      const parts = path.split('.');
      let target = npc;
      for (let i = 0; i < parts.length; i++) {
        const key = parts[i];
        const isLast = i === parts.length - 1;
        // handle numeric indices for arrays
        const idx = Number.isFinite(Number(key)) ? Number(key) : null;
        if (isLast) {
          if (idx !== null && Array.isArray(target)) target[idx] = value;
          else target[key] = value;
        } else {
          if (idx !== null) {
            if (!Array.isArray(target)) break;
            if (!target[idx]) target[idx] = {};
            target = target[idx];
          } else {
            if (target[key] == null) target[key] = {};
            target = target[key];
          }
        }
      }
    }
  }

  // Read a value from actor data using a dotted path like 'system.attributes.hp.max'
  function getValueAt(doc, path) {
    console.log(doc);
    console.log(path);
    if (!doc || !path) return undefined;
    const parts = path.split('.');
    let cur = doc;
    for (const p of parts) {
      if (cur == null) return undefined;
      // numeric index handling
      const idx = Number.isFinite(Number(p)) ? Number(p) : null;
      cur = idx !== null && Array.isArray(cur) ? cur[idx] : cur[p];
    }
    return cur;
  }



  async function getCRprops(currentCRBreakdown) {
    // Build dialog props
  const defensive = CRCalculator.formatCR(currentCRBreakdown.defensiveCR);
  const offensive = CRCalculator.formatCR(currentCRBreakdown.offensiveCR);
  // initialCR should reflect the actor's stored CR (the "initial" value before applying changes).
  // Prefer the semantically-named `calculatedCR` from the breakdown.
  const initialRaw = $actor?.system?.details?.cr ?? (currentCRBreakdown.calculatedCR);
  const initialCR = ensureNumberCR(initialRaw, 0);
    const xp = currentCRBreakdown.xp ?? 0;
    const pb = currentCRBreakdown.proficiencyBonus ?? 2;
    
    // Gather detailed breakdown data for the dialog details
    const hp = $actor?.system?.attributes?.hp?.max ?? $actor?.system?.attributes?.hp?.value ?? 1;
    const ac = $actor?.system?.attributes?.ac?.value ?? 10;
    const defTable = CRCalculator.CR_TABLES.defensive?.[currentCRBreakdown.defensiveCR] ?? { hp: [hp, hp], ac };
    const [hpMin, hpMax] = defTable.hp ?? [hp, hp];
    const expectedAC = defTable.ac ?? ac;
    const acDiff = (ac - expectedAC);

    const dpr = await CRCalculator.calculateAverageDPR($actor);
    const offTable = CRCalculator.CR_TABLES.offensive?.[currentCRBreakdown.offensiveCR] ?? { dpr: [dpr, dpr], attack: 0, save: 10 };
    const [dprMin, dprMax] = offTable.dpr ?? [dpr, dpr];
    const expectedAttack = offTable.attack ?? 0;
    const expectedSave = offTable.save ?? 10;
    const highestAttack = CRCalculator.getHighestAttackBonus($actor);
    const highestSave = CRCalculator.getHighestSaveDC($actor);
    const attackDiff = highestAttack - expectedAttack;
    const saveDiff = highestSave - expectedSave;
    const crGap = Math.abs((currentCRBreakdown.defensiveCR ?? 0) - (currentCRBreakdown.offensiveCR ?? 0));
    const finalRule = crGap >= 1 ? 'Higher CR used (difference ≥ 1)' : 'Average of defensive & offensive';
    return {
        defensive,
        offensive,
        initialCR,
        xp,
        pb,
        hp,
        hpMin,
        hpMax,
        ac,
        expectedAC,
        acDiff,
        dpr,
        dprMin,
        dprMax,
        highestAttack,
        expectedAttack,
        highestSave,
        expectedSave,
        attackDiff,
        saveDiff,
        finalRule
      }
  }

  async function handle_CR_Click(type="calc", desiredCRval) {
    if (!$actor) return;
    console.log('🔄 Recalculating CR for actor:', $actor);
    currentCRBreakdown = await CRCalculator.calculateCurrentCR($actor);
    console.log('📊 New CR breakdown:', currentCRBreakdown);
    // Force a reactive update
    currentCRBreakdown = { ...currentCRBreakdown };

    const CRprops = await getCRprops(currentCRBreakdown);
    let result;
    // Open Svelte-based dialog with Apply button using TJSDialog.prompt
    try {
      // Prepare a one-time global listener for the dialog's 'apply' event.
      const onApply = async (e) => {
        try {
          // Prefer the selected target provided by the dialog content; fall back to event.detail or calculatedCR
          const value = ensureNumberCR($selectedTargetCR ?? e.detail?.targetCR ?? currentCRBreakdown.calculatedCR, 0);
          const updates = CRCalculator.adjustActorToCR($actor, value) || {};
          // Always ensure cr/xp are present as a minimum fallback
          if (!updates['system.details.cr']) updates['system.details.cr'] = value;
          if (!updates['system.details.xp.value']) updates['system.details.xp.value'] = currentCRBreakdown.xp ?? 0;
                await updateSource($actor, updates);
          // Apply updates to local npc for reactivity
          applyUpdatesToLocalNpc(updates);
          ui.notifications?.info?.(`Applied CR ${CRCalculator.formatCR(value)} (XP ${currentCRBreakdown.xp ?? 0}) to actor.`);
        } catch (err) {
          console.error('Failed to apply CR via dialog apply event:', err);
          ui.notifications?.error?.('Failed to apply calculated CR.');
        } finally {
          // reset selected target
          selectedTargetCR.set(null);
        }
      };
  // Previous global apply event listener removed - dialog chrome button now invokes apply directly.
      switch(type) {
        case 'apply': 
          result = await openCRWait(t('CRCalculator.ApplicatorTitle'), CRprops );
          // const result = await 
          break;
        default: // 'calc'
          result = await openCRPrompt(t('CRCalculator.Title'), CRprops );

      }

      if (result) {
          try {
            // If the user used the prompt's primary OK button, fall back to applying the calculatedCR
            const value = currentCRBreakdown.calculatedCR;
            await updateSource($actor, { 'system.details.cr': value, 'system.details.xp.value': currentCRBreakdown.xp ?? 0 });
            ui.notifications?.info?.(`Applied CR ${CRCalculator.formatCR(value)} (XP ${currentCRBreakdown.xp ?? 0}) to actor.`);
          } catch (err) {
            console.error('Failed to apply CR:', err);
            ui.notifications?.error?.('Failed to apply calculated CR.');
          }
      }
    } catch (e) {
      console.error('Failed opening TJSDialog:', e);
    }
  }


</script>

<template lang="pug">
  .npc-stat-block
    +if("readonly")
      h2.name {name}
      +else()
        +if("editingName")
          input.name-input(
            type="text"
            value="{name}"
            on:blur!="{e => { console.log('🔄 Name input blur event, value:', e.target.value); editingName = false; }}"
            on:keydown!="{e => { if (e.key === 'Enter') { console.log('🔄 Name input Enter key pressed, value:', e.target.value); updateActorName(e.target.value); editingName = false; } }}"
            placeholder="Enter NPC name"
            autofocus
          )
          +else()
            h2.name.name-editable(
              on:click!="{() => { console.log('🖱️ Name field clicked!'); editingName = true; }}"
              class!="{editingName ? 'editing' : ''}"
            ) {name}
    .details
      span.mr-sm.smaller
        +if("readonly")
          span {SIZES[npc?.system?.traits?.size] || ucfirst(npc?.system?.traits?.size)}
          +else()
            +if("editingSize")
              select.size-select(
                value="{npc?.system?.traits?.size || 'med'}"
                on:change!="{e => { console.log('🔄 Size selection changed to:', e.target.value); updateActorSize(e.target.value); editingSize = false; }}"
                on:blur!="{() => editingSize = false}"
              )
                +each("sizeOptions as option")
                  option(value="{option.value}") {option.label}
              +else()
                span.size-editable(
                  on:click!="{() => { console.log('🖱️ Size field clicked!'); editingSize = true; }}"
                  class!="{editingSize ? 'editing' : ''}"
                ) {SIZES[npc?.system?.traits?.size] || ucfirst(npc?.system?.traits?.size)}
      span.mr-sm.smaller
        +if("readonly")
          span {ucfirst(npc?.system?.details?.type?.value)}
          +else()
            +if("editingType")
              select.type-select(
                value="{npc?.system?.details?.type?.value || 'humanoid'}"
                on:change!="{e => { console.log('🔄 Type selection changed to:', e.target.value); updateActorType(e.target.value); editingType = false; }}"
                on:blur!="{() => editingType = false}"
              )
                +each("typeOptions as option")
                  option(value="{option.value}") {option.label}
              +else()
                span.type-editable(
                  on:click!="{() => { console.log('🖱️ Type field clicked!'); editingType = true; }}"
                  class!="{editingType ? 'editing' : ''}"
                ) {ucfirst(npc?.system?.details?.type?.value)}
      span.mr-sm.smaller
        +if("readonly")
          span {npc?.system?.details?.alignment || 'Unaligned'}
          +else()
            +if("editingAlignment")
              select.alignment-select(
                value="{npc?.system?.details?.alignment || 'unaligned'}"
                on:change!="{e => { console.log('🔄 Alignment selection changed to:', e.target.value); updateActorAlignment(e.target.value); editingAlignment = false; }}"
                on:blur!="{() => editingAlignment = false}" 
              )
                +each("alignmentOptions as option")
                  option(value="{option.value}") {option.label}
              +else()
                span.alignment-editable(
                  on:click!="{() => { console.log('🖱️ Alignment field clicked!'); editingAlignment = true; }}"
                  class!="{editingAlignment ? 'editing' : ''}"
                ) {npc?.system?.details?.alignment || 'Unaligned'}

    hr.my-ms
    
    .flexrow
      .flex1.pointer(role="button"
            tabindex="0"
            on:click!="{() => { if (!readonly) handle_CR_Click('apply', crValue); }}"
            on:keydown!="{e => e.key === 'Enter' && !readonly && updateActorCR(crValue)}"
            title="Click to retarget CR")
        .label.inline Challenge 
        .value.nowrap
          // When clicking the CR value, open the retarget dialog (unless readonly).
          span(
            
          ) {crValue}
          span.ml-sm  (
          span {xp.toLocaleString()} XP )
      
      +if("enableCrCalculator && !readonly")
        .flex0
          button.cr-calc-btn(title="Open CR calculator" on:click!="{() => handle_CR_Click('calc')}")
            i.fas.fa-solid.fa-calculator

      .flex1.ml-sm
        .label.inline Proficiency Bonus 
        .value +{pb}
      
    hr.my-sm
    
    .value
      ArmorClass(
        ac="{npc?.system?.attributes?.ac}"
        readonly="{readonly}"
        on:acUpdate!="{e => updateActorAC(e.detail.value)}"
      )
    HitPoints(
      hp="{npc?.system?.attributes?.hp}" 
      readonly="{readonly}"
      on:hpUpdate!="{e => updateActorHP(e.detail.type, e.detail.value)}"
    )
    Speed(movement="{npc?.system?.attributes?.movement}" readonly="{readonly}" on:speedUpdate!="{e => updateActorSpeed(e.detail.type, e.detail.value)}")
    hr.my-sm
    .abilities
      +each("abilityScores as ab")
        AttributeScore(
          abbreviation="{ab.abbr}" 
          score="{ab.score}" 
          readonly="{readonly}"
          includeRollButtons="{includeRollButtons}"
          on:scoreUpdate!="{e => updateActorAbilityScore(e.detail.ability, e.detail.value)}"
        )
    hr.my-sm
    
    .flexrow.justify-flexrow-vertical-top.gap-4

      .flex1
        Skills(
          skills="{npc?.system?.skills || {}}"
          readonly="{readonly}"
          on:skillUpdate!="{e => updateActorSkills(e.detail.skill, e.detail.proficient, e.detail.ability)}"
        )
      .flex1
        SavingThrows(
          abilities="{npc?.system?.abilities || {}}"
          proficiencyBonus="{pb}"
          readonly="{readonly}"
          includeRollButtons="{includeRollButtons}"
          on:savingThrowUpdate!="{e => updateActorSavingThrows(e.detail)}"
        )
    hr.my-sm
    +if("dr && dr.length > 0")
      .mt-xxs
        .label.inline Damage Resistances 
        .value
          EditableValue(
            value="{dr}"
            readonly="{readonly}"
            onSave!="{val => updateActorDamageResistances(val)}"
            placeholder="None"
          )
    +if("di && di.length > 0")
      .mt-xxs
        .label.inline Damage Immunities 
        .value
          EditableValue(
            value="{di}"
            readonly="{readonly}"
            onSave!="{val => updateActorDamageImmunities(val)}"
            placeholder="None"
          )
    +if("dv && dv.length > 0")
      .mt-xxs
        .label.inline Damage Vulnerabilities 
        .value
          EditableValue(
            value="{dv}"
            readonly="{readonly}"
            onSave!="{val => updateActorDamageVulnerabilities(val)}"
            placeholder="None"
          )
    +if("ci && ci.length > 0")
      .mt-xxs
        .label.inline Condition Immunities 
        .value
          EditableValue(
            value="{ci}"
            readonly="{readonly}"
            onSave!="{val => updateActorConditionImmunities(val)}"
            placeholder="None"
          )
    .mt-xxs
      Senses(
        senses="{npc?.system?.attributes?.senses || {}}"
        readonly="{readonly}"
        on:senseUpdate!="{e => updateActorSenses(e.detail.sense, e.detail.value)}"
      )
    hr.my-sm
    .mt-xxs
      Languages(
        languages="{npc?.system?.traits?.languages || {}}"
        readonly="{readonly}"
        on:languageUpdate!="{e => updateActorLanguages(e.detail)}"
      )
    
    //- Traits (summary)
    +if("legendaryResistances && legendaryResistances.length > 0")
      .mt-sm
        .label.inline Traits 
        .value
          EditableValue(
            value="{legendaryResistances}"
            readonly="{readonly}"
            onSave!="{val => updateActorLegendaryResistances(val)}"
            placeholder="None"
          )
    +if("legendaryActions && legendaryActions.length > 0")
      .mt-sm
        .label.inline Legendary Actions 
        .value This creature can take 
          EditableValue(
            value="{npc?.system?.resources?.legact?.value || 3}"
            type="number"
            readonly="{readonly}"
            onSave!="{val => updateActorLegendaryActions(val)}"
            placeholder="3"
          )
          span  legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.
      ul.mt-xxs
        +each("legendaryActions as la")
          li.left
            .flexrow.gap-4
              .flex2
                +if("la.item?.link")
                  +await("enrichHTML(la.item.link || '')")
                    +then("Html")
                      span {@html Html}
                  +else()
                    span {la.item?.name}
                span {la.costNote}
                span .
                span {@html la.desc}

    //- CR Calculator popup
    +if("false")
      //- .modal-backdrop(on:click!="{() => showCrCalc = false}")
      //- .modal
      //-   .modal-header
      //-     h3 CR Calculator
      //-     button.close-btn(title="Close" on:click!="{() => showCrCalc = false}") ×
      //-   .modal-body
      //-     +if("crCalcResult")
      //-       .summary
      //-         p Current CR: {crCalcResult.currentCr}
      //-         p Suggested CR: {crCalcResult.suggestedCr}
      //-         p Reason: {crCalcResult.reason}
      //-       button.link-btn(on:click!="{() => showCrDetails = !showCrDetails}") {showCrDetails ? 'Hide details' : 'Show details'}
      //-       +if("showCrDetails")
      //-         .details
      //-           p Method: {crCalcResult.details.method}
      //-           p Exact XP match: {crCalcResult.details.exactMatch ? 'Yes' : 'No'}
      //-           p XP value: {crCalcResult.details.xpValue}
      //-           .mapping
      //-             p XP table (CR → XP):
      //-             ul.scrollable
      //-               +each("crCalcResult.details.mapping as row")
      //-                 li CR {row.cr}: {row.xp}
      //-   .modal-footer
      //-     button.apply-btn(on:click!="{applySuggestedCr}") Apply Suggested CR
      //-     button.cancel-btn(on:click!="{() => showCrCalc = false}") Cancel

  //- Items list (generic)
  //- +if("getItemsArray(npc?.items)?.length")
  //-   h3.mt-sm Features
  //-   FeatureItemList(items="{itemsArray}")
</template>

<style lang="sass">
.npc-stat-block
  .details
    font-style: italic
    margin-bottom: 0.5em
  .abilities
    display: grid
    grid-template-columns: repeat(6, 1fr)
    margin-top: 0.5em

.name
  margin: 0

.name-input
  width: 100%
  font-size: 1.5rem
  font-weight: bold
  border: 1px solid #ccc
  border-radius: 4px
  padding: 0.5rem
  margin-bottom: 0.5rem
  background: white
  color: #333
  // Ensure proper contrast in dark theme
  &::placeholder
    color: #666

  &:focus
    outline: none
    border-color: var(--color-border-highlight)
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25)

.name-editable
  cursor: pointer
  transition: background-color 0.2s ease
  border-radius: 4px
  padding: 0.25rem 0.5rem

  &:hover
    background-color: rgba(0, 123, 255, 0.1)

  &.editing
    background-color: rgba(0, 123, 255, 0.2)
    border: 1px solid var(--color-border-highlight)

.size-select,
.type-select,
.alignment-select
  background: white
  border: 1px solid #ccc
  border-radius: 4px
  padding: 0.25rem 0.5rem
  font-size: 0.9rem
  color: #333
  min-width: 120px
  // Ensure proper contrast in dark theme
  &::placeholder
    color: #666

  &:focus
    outline: none
    border-color: var(--color-border-highlight)
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25)

  // Style the options for better contrast
  option
    background: white
    color: #333

.size-editable,
.type-editable,
.alignment-editable
  cursor: pointer
  padding: 0.25rem 0.5rem
  border-radius: 4px
  transition: background-color 0.2s ease
  display: inline-block
  min-width: 80px

  &:hover
    background-color: rgba(0, 123, 255, 0.1)

  &.editing
    background-color: rgba(0, 123, 255, 0.2)
    border: 1px solid var(--color-border-highlight)

.mt-sm
  margin-top: 0.75em

.mt-xxs
  margin-top: 0.25em

.cr-calc-btn
  margin-left: 0.5rem
  background: transparent
  border: 1px solid #ccc
  border-radius: 4px
  padding: 0 0.4rem
  cursor: pointer
  &:hover
    background: rgba(0,0,0,0.05)

.modal-backdrop
  position: fixed
  inset: 0
  background: rgba(0,0,0,0.4)
  z-index: 1000

.modal
  position: fixed
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  background: var(--app-background, #fff)
  color: inherit
  width: min(520px, 95vw)
  max-height: 80vh
  display: flex
  flex-direction: column
  border-radius: 8px
  border: 1px solid var(--color-border, #888)
  z-index: 1001

  .modal-header
    display: flex
    justify-content: space-between
    align-items: center
    padding: 0.5rem 0.75rem
    border-bottom: 1px solid var(--color-border, #888)

    .close-btn
      background: transparent
      border: none
      font-size: 1.2rem
      cursor: pointer

  .modal-body
    padding: 0.75rem

    .mapping
      ul.scrollable
        max-height: 200px
        overflow: auto

  .modal-footer
    display: flex
    gap: 0.5rem
    justify-content: flex-end
    padding: 0.5rem 0.75rem
    border-top: 1px solid var(--color-border, #888)

    .apply-btn
      background: var(--color-accent, #2e7d32)
      color: #fff
      border: none
      border-radius: 4px
      padding: 0.35rem 0.6rem
      cursor: pointer
    .cancel-btn, .link-btn
      background: transparent
      border: 1px solid #aaa
      border-radius: 4px
      padding: 0.35rem 0.6rem
      cursor: pointer
</style>