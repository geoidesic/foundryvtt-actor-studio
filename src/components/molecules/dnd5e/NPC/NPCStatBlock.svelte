<script>
  import { TJSDialog } from "@typhonjs-fvtt/runtime/svelte/application";
  import { getContext } from "svelte";
  import { CRCalculator } from "~/src/helpers/CRCalculator.js";
  import { ucfirst, getItemsArray, updateSource, dnd5eModCalc, normalizeList, SIZES, pbForCR, xpForCR } from "~/src/helpers/Utility";
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
  export let npc; 
  export let readonly = true; // Default to readonly for backward compatibility
  export let includeRollButtons = false;
  export let enableCrCalculator = false; // guard for CR calculator UI

  const actor = getContext("#doc");

  // State for inline editing
  let editingSize = false;
  let editingType = false;
  let editingAlignment = false;
  let editingName = false;
  let currentCRBreakdown = null;

  const abilityOrder = ["str","dex","con","int","wis","cha"];
  // Reactive list of ability scores for rendering AttributeScore components
  $: abilityScores = abilityOrder.map(abbr => ({ abbr, score: npc?.system?.abilities?.[abbr]?.value ?? 10 }));
  
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
  const typeOptions = [
    { value: 'aberration', label: 'Aberration' },
    { value: 'beast', label: 'Beast' },
    { value: 'celestial', label: 'Celestial' },
    { value: 'construct', label: 'Construct' },
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

  // Skills
  const skillToLabel = {
    acr: 'Acrobatics', ani: 'Animal Handling', arc: 'Arcana', ath: 'Athletics', dec: 'Deception',
    his: 'History', ins: 'Insight', itm: 'Intimidation', inv: 'Investigation', med: 'Medicine',
    nat: 'Nature', prc: 'Perception', prf: 'Performance', per: 'Persuasion', rel: 'Religion',
    slt: 'Sleight of Hand', ste: 'Stealth', sur: 'Survival'
  };

  // Use dnd5eModCalc from Utility

  function skillBonus(key) {
    const skill = npc?.system?.skills?.[key];
    if (!skill) return null;
    const ability = skill.ability || 'int';
    const abilityScore = npc?.system?.abilities?.[ability]?.value ?? 10;
  const mod = dnd5eModCalc(abilityScore);
    const tier = Number(skill.value) || 0; // 0/1/2
    const pb = pbForCR(npc?.system?.details?.cr ?? 0);
    return mod + (tier * pb);
  }

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
  $: passivePerception = (() => {
    const prc = npc?.system?.skills?.prc;
    if (!prc) return 10;
    const bonus = skillBonus('prc') || 0;
    return 10 + bonus;
  })();

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
  $: cr = npc?.system?.details?.cr ?? 0;
  $: pb = pbForCR(cr);
  $: xp = xpForCR(cr);
  
  // Challenge Rating and XP for editing
  $: crValue = npc?.system?.details?.cr ?? 0;
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
    console.log('🔍 updateActorName called with value:', value);
    console.log('🔍 Actor context:', actor);
    console.log('🔍 $actor value:', $actor);
    console.log('🔍 NPC data:', npc);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update...');
      try {
        console.log('📝 Calling Utility.updateSource with:', { name: value });
        await updateSource($actor, { name: value });
        console.log('✅ Utility.updateSource completed');
        
        // Also update the local npc object for reactivity
        if (npc) {
          console.log('🔄 Updating local npc.name from', npc.name, 'to', value);
          npc.name = value;
          console.log('✅ Local npc.name updated to:', npc.name);
        }
        
        console.log('🎉 Name update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor name:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }

  async function updateActorSize(value) {
    console.log('🔍 updateActorSize called with value:', value);
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update size...');
      try {
        console.log('📝 Calling Utility.updateSource with:', { 'system.traits.size': value });
        await updateSource($actor, { 'system.traits.size': value });
        console.log('✅ Utility.updateSource completed');
        
        // Also update the local npc object for reactivity
        if (npc?.system?.traits) {
          console.log('🔄 Updating local npc.system.traits.size from', npc.system.traits.size, 'to', value);
          npc.system.traits.size = value;
          console.log('✅ Local npc.system.traits.size updated to:', npc.system.traits.size);
        }
        
        console.log('🎉 Size update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor size:', error);
        console.error('❌ Error stack:', error.stack);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }

  async function updateActorType(value) {
    console.log('🔍 updateActorType called with value:', value);
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update type...');
      try {
        console.log('📝 Calling Utility.updateSource with:', { 'system.details.type.value': value });
        await updateSource($actor, { 'system.details.type.value': value });
        console.log('✅ Utility.updateSource completed');
        
        // Also update the local npc object for reactivity
        if (npc?.system?.details?.type) {
          console.log('🔄 Updating local npc.system.details.type.value from', npc.system.details.type.value, 'to', value);
          npc.system.details.type.value = value;
          console.log('✅ Local npc.system.details.type.value updated to:', npc.system.details.type.value);
        }
        
        console.log('🎉 Type update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor type:', error);
        console.error('❌ Error stack:', error.stack);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }

  async function updateActorAlignment(value) {
    console.log('🔍 updateActorAlignment called with value:', value);
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update alignment...');
      try {
        console.log('📝 Calling Utility.updateSource with:', { 'system.details.alignment': value });
        await updateSource($actor, { 'system.details.alignment': value });
        console.log('✅ Utility.updateSource completed');
        
        // Also update the local npc object for reactivity
        if (npc?.system?.details) {
          console.log('🔄 Updating local npc.system.details.alignment from', npc.system.details.alignment, 'to', value);
          npc.system.details.alignment = value;
          console.log('✅ Local npc.system.details.alignment updated to:', npc.system.details.alignment);
        }
        
        console.log('🎉 Alignment update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor alignment:', error);
        console.error('❌ Error stack:', error.stack);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }



  async function updateActorSkills(skill, proficient, ability) {
    console.log('🔍 updateActorSkills called with:', { skill, proficient, ability });
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update skills...');
      try {
        const updateData = {
          [`system.skills.${skill}.proficient`]: proficient,
          [`system.skills.${skill}.ability`]: ability
        };
        
        console.log('📝 Calling Utility.updateSource with:', updateData);
        await updateSource($actor, updateData);
        console.log('✅ Utility.updateSource completed');
        
        // Also update the local npc object for reactivity
        if (npc?.system?.skills) {
          if (!npc.system.skills[skill]) {
            npc.system.skills[skill] = {};
          }
          npc.system.skills[skill].proficient = proficient;
          npc.system.skills[skill].ability = ability;
        }
        
        console.log('🎉 Skills update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor skills:', error);
        console.error('❌ Error stack:', error.stack);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }

  async function updateActorDamageResistances(value) {
    if ($actor) {
      try {
        await updateSource($actor, { 'system.traits.dr': value });
        // Also update the local npc object for reactivity
        if (npc?.system?.traits) npc.system.traits.dr = value;
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
        if (npc?.system?.traits) npc.system.traits.di = value;
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
        if (npc?.system?.traits) npc.system.traits.dv = value;
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
        if (npc?.system?.traits) npc.system.traits.ci = value;
      } catch (error) {
        console.error('Failed to update actor condition immunities:', error);
      }
    }
  }

  async function updateActorSenses(sense, value) {
    console.log('🔍 updateActorSenses called with:', { sense, value });
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update senses...');
      try {
        const updateData = {
          [`system.attributes.senses.${sense}`]: value
        };
        
        console.log('📝 Calling Utility.updateSource with:', updateData);
        await updateSource($actor, updateData);
        console.log('✅ Utility.updateSource completed');
        
        // Also update the local npc object for reactivity
        if (npc?.system?.attributes?.senses) {
          npc.system.attributes.senses[sense] = value;
        }
        
        console.log('🎉 Senses update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor senses:', error);
        console.error('❌ Error stack:', error.stack);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }

  async function updateActorPassivePerception(value) {
    if ($actor) {
      try {
        await updateSource($actor, { 'system.attributes.prof': parseInt(value) || 2 });
        // Also update the local npc object for reactivity
        if (npc?.system?.attributes) npc.system.attributes.prof = parseInt(value) || 10;
      } catch (error) {
        console.error('Failed to update actor passive perception:', error);
      }
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
            // Add custom language
            const currentCustom = npc?.system?.traits?.languages?.custom || '';
            const newCustom = currentCustom ? `${currentCustom}, ${language}` : language;
            await updateSource($actor, { 'system.traits.languages.custom': newCustom });
            if (npc?.system?.traits?.languages) {
              npc.system.traits.languages.custom = newCustom;
            }
          } else {
            // Add standard language
            const currentLanguages = npc?.system?.traits?.languages?.value || [];
            const newLanguages = Array.isArray(currentLanguages) ? [...currentLanguages, language] : [language];
            await updateSource($actor, { 'system.traits.languages.value': newLanguages });
            if (npc?.system?.traits?.languages) {
              npc.system.traits.languages.value = newLanguages;
            }
          }
        } else if (type === 'remove') {
          if (isCustom) {
            // Remove custom language
            const currentCustom = npc?.system?.traits?.languages?.custom || '';
            const newCustom = currentCustom.split(',').filter(lang => lang.trim() !== language).join(', ').trim();
            await updateSource($actor, { 'system.traits.languages.custom': newCustom });
            if (npc?.system?.traits?.languages) {
              npc.system.traits.languages.custom = newCustom;
            }
          } else {
            // Remove standard language
            const currentLanguages = npc?.system?.traits?.languages?.value || [];
            const newLanguages = currentLanguages.filter(lang => lang !== language);
            await updateSource($actor, { 'system.traits.languages.value': newLanguages });
            if (npc?.system?.traits?.languages) {
              npc.system.traits.languages.value = newLanguages;
            }
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
          if (npc?.system?.abilities?.[ability]) npc.system.abilities[ability].proficient = true;
        } else if (type === 'remove') {
          // Remove saving throw proficiency
          await updateSource($actor, { [`system.abilities.${ability}.proficient`]: false });
          if (npc?.system?.abilities?.[ability]) npc.system.abilities[ability].proficient = false;
        }
        
        console.log('✅ Saving throws updated successfully');
      } catch (error) {
        console.error('❌ Failed to update actor saving throws:', error);
      }
    } else {
      console.log('❌ No actor found');
    }
  }

  async function updateActorCR(value) {
    if ($actor) {
      try {
        await updateSource($actor, { 'system.details.cr': value });
        // Also update the local npc object for reactivity
        if (npc?.system?.details) npc.system.details.cr = value;
      } catch (error) {
        console.error('Failed to update actor CR:', error);
      }
    }
  }

  async function updateActorXP(value) {
    if ($actor) {
      try {
        await updateSource($actor, { 'system.details.xp.value': parseInt(value) || 200 });
        // Also update the local npc object for reactivity
        if (npc?.system?.details?.xp) npc.system.details.xp.value = parseInt(value) || 200;
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
        if (npc?.system?.attributes) npc.system.attributes.pb = parseInt(value) || 2;
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
        if (npc?.system?.traits) npc.system.traits.legendaryResistances = value;
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
        if (npc?.system?.resources?.legact) npc.system.resources.legact.value = parseInt(value) || 3;
      } catch (error) {
        console.error('Failed to update actor legendary actions:', error);
      }
    }
  }

  // Handle ability score updates from AttributeScore components
  async function updateActorAbilityScore(ability, value) {
    console.log('🔍 updateActorAbilityScore called with:', { ability, value });
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update ability score...');
      try {
        console.log('📝 Calling Utility.updateSource with:', { [`system.abilities.${ability}.value`]: value });
        await updateSource($actor, { [`system.abilities.${ability}.value`]: value });
        console.log('✅ Utility.updateSource completed');
        
        // Also update the local npc object for reactivity
        if (npc?.system?.abilities?.[ability]) {
          console.log('🔄 Updating local npc.system.abilities', ability, 'from', npc.system.abilities[ability].value, 'to', value);
          npc.system.abilities[ability].value = value;
          console.log('✅ Local npc.system.abilities', ability, 'updated to:', npc.system.abilities[ability].value);
        }
        
        console.log('🎉 Ability score update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor ability score:', error);
        console.error('❌ Error stack:', error.stack);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }

  // Handle HP updates from HitPoints component
  async function updateActorHP(type, value) {
    console.log('🔍 updateActorHP called with:', { type, value });
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update HP...');
      try {
        let updateData = {};
        if (type === 'max') {
          updateData = {
            'system.attributes.hp.max': value,
            'system.attributes.hp.value': value
          };
        } else if (type === 'formula') {
          updateData = {
            'system.attributes.hp.formula': value
          };
        }
        
        console.log('📝 Calling Utility.updateSource with:', updateData);
        await updateSource($actor, updateData);
        console.log('✅ Utility.updateSource completed');
        
        // Also update the local npc object for reactivity
        if (npc?.system?.attributes?.hp) {
          if (type === 'max') {
            npc.system.attributes.hp.max = value;
            npc.system.attributes.hp.value = value;
          } else if (type === 'formula') {
            npc.system.attributes.hp.formula = value;
          }
        }
        
        console.log('🎉 HP update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor HP:', error);
        console.error('❌ Error stack:', error.stack);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }

  // Handle Speed updates from Speed component
  async function updateActorSpeed(type, value) {
    console.log('🔍 updateActorSpeed called with:', { type, value });
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update speed...');
      try {
        console.log('📝 Calling Utility.updateSource with:', { [`system.attributes.movement.${type}`]: value });
        await updateSource($actor, { [`system.attributes.movement.${type}`]: value });
        console.log('✅ Utility.updateSource completed');
        
        // Also update the local npc object for reactivity
        if (npc?.system?.attributes?.movement) {
          npc.system.attributes.movement[type] = value;
        }
        
        console.log('🎉 Speed update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor speed:', error);
        console.error('❌ Error stack:', error.stack);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }

  // Handle AC updates from ArmorClass component
  async function updateActorAC(value) {
    console.log('🔍 updateActorAC called with:', { value });
    console.log('🔍 $actor value:', $actor);
    
    if ($actor) {
      console.log('✅ $actor found, attempting to update AC...');
      try {
        console.log('📝 Calling Utility.updateSource with:', { 'system.attributes.ac.value': value });
        await updateSource($actor, { 'system.attributes.ac.value': value });
        console.log('✅ Utility.updateSource completed');
        
        // Also update the local npc object for reactivity
        if (npc?.system?.attributes?.ac) {
          npc.system.attributes.ac.value = value;
        }
        
        console.log('🎉 AC update completed successfully');
      } catch (error) {
        console.error('❌ Failed to update actor AC:', error);
        console.error('❌ Error stack:', error.stack);
      }
    } else {
      console.error('❌ No $actor found!');
    }
  }

  async function calculateCR() {
    if (!$actor) return;
    
    console.log('🔄 Recalculating CR for actor:', $actor);
    currentCRBreakdown = await CRCalculator.calculateCurrentCR($actor);
    console.log('📊 New CR breakdown:', currentCRBreakdown);

    // Force a reactive update
    currentCRBreakdown = { ...currentCRBreakdown };

    // Build dialog props
    const defensive = CRCalculator.formatCR(currentCRBreakdown.defensiveCR);
    const offensive = CRCalculator.formatCR(currentCRBreakdown.offensiveCR);
    const finalCR = CRCalculator.formatCR(currentCRBreakdown.finalCR);
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
    // Open Svelte-based dialog with Apply button using TJSDialog.prompt
    try {
      const result = await TJSDialog.prompt({
        title: game?.i18n?.localize ? game.i18n.localize('GAS.CRCalculator.Title') : 'CR Calculator',
        draggable: false,
        minimizable: false,
        modal: true,
        content: {
          class: CRCalculatorDialog,
          props: {
            defensive,
            offensive,
            finalCR,
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
        },
        label: game?.i18n?.localize ? game.i18n.localize('GAS.CRCalculator.Apply') : 'Apply CR'
      }, { classes: ['tjs-actor-studio'] });

      if (result) {
        try {
          const value = currentCRBreakdown.finalCR;
          await updateSource($actor, { 'system.details.cr': value, 'system.details.xp.value': currentCRBreakdown.xp ?? 0 });
          if (npc?.system?.details) {
            npc.system.details.cr = value;
            if (npc.system.details.xp) npc.system.details.xp.value = currentCRBreakdown.xp ?? 0;
          }
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
      .flex1
        .label.inline Challenge 
        .value.nowrap
          EditableValue(
            value="{crValue}"
            readonly="{readonly}"
            onSave!="{val => updateActorCR(val)}"
            placeholder="1"
          )
          span  (
          EditableValue(
            value="{xpValue}"
            type="number"
            readonly="{readonly}"
            onSave!="{val => updateActorXP(val)}"
            placeholder="200"
          )
          span  XP )
      
      +if("enableCrCalculator && !readonly")
        .flex0
          button.cr-calc-btn(title="Open CR calculator" on:click!="{calculateCR}")
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
    
    .flexrow.justify-flexrow-vertical-top
      .flex1
        Skills(
          skills="{npc?.system?.skills || {}}"
          readonly="{readonly}"
          on:skillUpdate!="{e => updateActorSkills(e.detail.skill, e.detail.proficient, e.detail.ability)}"
        )
      .flex1.ml-sm
        SavingThrows(
          abilities="{npc?.system?.abilities || {}}"
          proficiencyBonus="{pb}"
          readonly="{readonly}"
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
      span  ( Passive Perception 
      EditableValue(
        value="{passivePerception}"
        type="number"
        readonly="{readonly}"
        onSave!="{val => updateActorPassivePerception(val)}"
        placeholder="10"
      )
      span )
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