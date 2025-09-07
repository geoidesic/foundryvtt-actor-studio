<script>
  import { getContext } from 'svelte';
  const actor = getContext('#doc');
  const documentStore = getContext('#doc');
  $: npc = $documentStore;

  const allSkills = [
    { key: 'acr', label: 'Acrobatics' },
    { key: 'ani', label: 'Animal Handling' },
    { key: 'arc', label: 'Arcana' },
    { key: 'ath', label: 'Athletics' },
    { key: 'dec', label: 'Deception' },
    { key: 'his', label: 'History' },
    { key: 'ins', label: 'Insight' },
    { key: 'itm', label: 'Intimidation' },
    { key: 'inv', label: 'Investigation' },
    { key: 'med', label: 'Medicine' },
    { key: 'nat', label: 'Nature' },
    { key: 'prc', label: 'Perception' },
    { key: 'prf', label: 'Performance' },
    { key: 'per', label: 'Persuasion' },
    { key: 'rel', label: 'Religion' },
    { key: 'slt', label: 'Sleight of Hand' },
    { key: 'ste', label: 'Stealth' },
    { key: 'sur', label: 'Survival' }
  ];

  function modStr(n){ return (n>=0?`+${n}`:`${n}`); }

  function getSkillMod(key){
    const s = npc?.system?.skills?.[key];
    return typeof s?.mod === 'number' ? s.mod : 0;
  }

  async function rollSkill(key){
    try {
      const a = $actor;
      if (a?.rollSkill) return a.rollSkill(key);
      if (a?.skills?.[key]?.roll) return a.skills[key].roll();
      ui?.notifications?.warn?.(`Skill roll not supported: ${key}`);
    } catch(err) { console.warn('Skill roll failed', err); }
  }
</script>

<template lang="pug">
  section
    ul.skills
      +each("allSkills as s")
        li
          button.icon(on:click!="{() => rollSkill(s.key)}" title="Roll {s.label}")
            i.fas.fa-dice-d20
          span.name {s.label}
          span.mod {modStr(getSkillMod(s.key))}
</template>

<style lang="sass">
section
  padding: .25rem
ul.skills
  list-style: none
  padding: 0
  margin: 0
  li
    display: grid
    grid-template-columns: 28px 1fr auto
    align-items: center
    gap: 6px
    padding: 2px 0
  .icon
    width: 24px
    height: 24px
    display: inline-flex
    align-items: center
    justify-content: center
    border: 1px solid var(--color-border,
      rgba(0,0,0,.2))
    border-radius: 4px
    background: rgba(0,0,0,.05)
  .name
    font-weight: 500
  .mod
    font-variant-numeric: tabular-nums
</style>
