<script>
  import AttributeScore from "~/src/components/atoms/dnd5e/NPC/AttributeScore.svelte";
  import ArmorClass from "~/src/components/atoms/dnd5e/NPC/ArmorClass.svelte";
  import HitPoints from "~/src/components/atoms/dnd5e/NPC/HitPoints.svelte";
  import Speed from "~/src/components/atoms/dnd5e/NPC/Speed.svelte";
  import { ucfirst } from "~/src/helpers/Utility";

  export let name;
  export let npc; 

  const abilityOrder = ["str","dex","con","int","wis","cha"];
  const sizes = {
    'grg': 'Gargantuan',
    'lg': 'Large',
    'med': 'Medium',
    'sm': 'Small',
    'tiny': 'Tiny'
  }

  // For svelte-preprocess pug: precompute ability scores for template
  $: abilityScores = abilityOrder.map(abbr => ({
    abbr,
    score: npc?.system?.abilities?.[abbr]?.value
  }));

  function abilityMod(score) {
    if (typeof score !== 'number') return 0;
    return Math.floor((score - 10) / 2);
  }

  function formatBonus(n) {
    return n >= 0 ? `+${n}` : `${n}`;
  }

  function pbForCR(cr) {
    const n = Number(cr) || 0;
    if (n <= 4) return 2;
    if (n <= 8) return 3;
    if (n <= 12) return 4;
    if (n <= 16) return 5;
    if (n <= 20) return 6;
    if (n <= 24) return 7;
    if (n <= 28) return 8;
    return 9;
  }

  function xpForCR(cr) {
    const table = {
      0: 10, 1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800, 6: 2300, 7: 2900, 8: 3900,
      9: 5000, 10: 5900, 11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
      16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000, 21: 33000, 22: 41000,
      23: 50000, 24: 62000, 25: 75000, 26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000
    };
    const n = Number(cr) || 0;
    return table[n] ?? 0;
  }

  // Normalize arrays that may sometimes be strings, Sets, or objects
  function normalizeList(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (val instanceof Set) return Array.from(val);
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    if (typeof val === 'object') return Object.keys(val).filter(k => !!val[k]);
    return [];
  }

  // Saving throws list (only proficient)
  const abilityLabel = { str: 'Str', dex: 'Dex', con: 'Con', int: 'Int', wis: 'Wis', cha: 'Cha' };
  $: savingThrowsList = abilityOrder
    .filter(abbr => npc?.system?.abilities?.[abbr]?.proficient)
    .map(abbr => {
      const score = npc?.system?.abilities?.[abbr]?.value ?? 10;
      const mod = abilityMod(score);
      const save = mod + pbForCR(npc?.system?.details?.cr ?? 0);
      return `${abilityLabel[abbr] || abbr.toUpperCase()} ${formatBonus(save)}`;
    });

  // Skills
  const skillToLabel = {
    acr: 'Acrobatics', ani: 'Animal Handling', arc: 'Arcana', ath: 'Athletics', dec: 'Deception',
    his: 'History', ins: 'Insight', itm: 'Intimidation', inv: 'Investigation', med: 'Medicine',
    nat: 'Nature', prc: 'Perception', prf: 'Performance', per: 'Persuasion', rel: 'Religion',
    slt: 'Sleight of Hand', ste: 'Stealth', sur: 'Survival'
  };

  function skillBonus(key) {
    const skill = npc?.system?.skills?.[key];
    if (!skill) return null;
    const ability = skill.ability || 'int';
    const abilityScore = npc?.system?.abilities?.[ability]?.value ?? 10;
    const mod = abilityMod(abilityScore);
    const tier = Number(skill.value) || 0; // 0/1/2
    const pb = pbForCR(npc?.system?.details?.cr ?? 0);
    return mod + (tier * pb);
  }

  $: skillsList = Object.keys(npc?.system?.skills || {})
    .filter(k => (npc?.system?.skills?.[k]?.value || 0) > 0)
    .map(k => `${skillToLabel[k] || k} ${formatBonus(skillBonus(k))}`);

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

  // Languages
  $: languages = (() => {
    const vals = normalizeList(npc?.system?.traits?.languages?.value);
    const custom = npc?.system?.traits?.languages?.custom || '';
    return [vals.join(', '), custom].filter(Boolean).join(', ');
  })();

  // PB / XP
  $: cr = npc?.system?.details?.cr ?? 0;
  $: pb = pbForCR(cr);
  $: xp = xpForCR(cr);

  // Simple trait summaries (from resources)
  $: legendaryResistances = (() => {
    const val = npc?.system?.resources?.legres?.value;
    return val && Number(val) > 0 ? `Legendary Resistance (${val}/Day)` : '';
  })();

  // Legendary Actions (from embedded items with activation.type === 'legendary')
  function getItemsArray(collection) {
    if (!collection) return [];
    if (Array.isArray(collection)) return collection;
    if (collection.contents) return collection.contents;
    try { return Array.from(collection); } catch (e) { return []; }
  }

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
</script>

<template lang="pug">
  .npc-stat-block
    h2.name {name}
    .details
      span.mr-sm.smaller {sizes[npc?.system?.traits?.size] || ucfirst(npc?.system?.traits?.size)},
      span.mr-sm.smaller {ucfirst(npc?.system?.details?.type?.value)},
      span.mr-sm.smaller {npc?.system?.details?.alignment}
    hr.my-sm
    
    .label.inline.mt-sm Armor Class 
    .value {npc?.system?.attributes?.ac.flat} ({npc?.system?.attributes?.ac?.calc === 'natural' ? 'natural armor' : npc?.system?.attributes?.ac?.calc})
    HitPoints(hp="{npc?.system?.attributes?.hp}")
    Speed(movement="{npc?.system?.attributes?.movement}")
    hr.my-sm
    .abilities
      +each("abilityScores as ab")
        AttributeScore(abbreviation="{ab.abbr}" score="{ab.score}")
    hr.my-sm
    
    +if("savingThrowsList?.length")
      .mt-sm
        .label.inline Saving Throws 
        .value {savingThrowsList.join(', ')}
    +if("skillsList?.length")
      .mt-xxs
        .label.inline Skills 
        .value {skillsList.join(', ')}
    +if("dr")
      .mt-xxs
        .label.inline Damage Resistances 
        .value {dr}
    +if("di")
      .mt-xxs
        .label.inline Damage Immunities 
        .value {di}
    +if("dv")
      .mt-xxs
        .label.inline Damage Vulnerabilities 
        .value {dv}
    +if("ci")
      .mt-xxs
        .label.inline Condition Immunities 
        .value {ci}
    .mt-xxs
      .label.inline Senses 
      .value {senseEntries()} (passive Perception {passivePerception})
    .mt-xxs
      .label.inline Languages 
      .value {languages}
    .mt-xxs
      .label.inline Challenge 
      .value {cr} ({xp.toLocaleString()} XP)
    .mt-xxs
      .label.inline Proficiency Bonus 
      .value +{pb}
    hr.my-sm
    //- Traits (summary)
    +if("legendaryResistances")
      .mt-sm
        .label.inline Traits 
        .value {legendaryResistances}
    +if("legendaryActions?.length")
      .mt-sm
        .label.inline Legendary Actions 
        .value This creature can take {npc?.system?.resources?.legact?.value || 3} legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. It regains spent legendary actions at the start of its turn.
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

  //- Items list (generic)
  +if("getItemsArray(npc?.items)?.length")
    h3.mt-sm Features
    ul.icon-list
      +each("itemsArray as item")
        li.left
          .flexrow.gap-4
            .flex0.relative.image.mr-sm
              img.icon(src="{item.img}" alt="{item.name}")
            +if("item?.link")
              +await("enrichHTML(item.link || '')")
                +then("Html")
                  .flex2 {@html Html}
              +else()
                .flex2 {item.name}
</template>

<style lang="sass">
.npc-stat-block
  margin: 1rem 0 0 0
  padding: 0.5em
  .details
    font-style: italic
    margin-bottom: 0.5em
  .abilities
    display: grid
    grid-template-columns: repeat(6, 1fr)
    margin-top: 0.5em

.name
  margin: 0

.mt-xs
  margin-top: 0.5em

.mt-sm
  margin-top: 0.75em

.mt-xxs
  margin-top: 0.25em
</style>