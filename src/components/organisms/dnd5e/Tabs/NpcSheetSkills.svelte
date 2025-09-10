<script>
  import { getContext } from 'svelte';
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

  async function rollSkill(key, event){
    npc.rollSkill({ skill: key, event })
  }
</script>

<template lang="pug">
  section
    ul.icon-list.skills
      +each("allSkills as s")
        li.left
          .flexrow
            .flex0
              button.icon-button.icon(type="button" on:click!="{(ev) => rollSkill(s.key, ev)}" title="Roll {s.label}" aria-label="Roll {s.label}")
                i.fas.fa-dice-d20
            .flex2.text.text-center
              span.skill-name {s.label}
            .flex0
              span.skill-mod.badge {modStr(getSkillMod(s.key))}
</template>

<style lang="sass">
section
  padding: .25rem

ul.icon-list.skills
  list-style: none
  margin: 0
  padding: 0

ul.icon-list.skills > li
  padding: 6px 0
  &:hover
    box-shadow: 4px 0px 8px 3px var(--actor-studio-color-primary) inset

.flexrow
  display: flex
  align-items: center

.icon-button
  width: 40px
  min-width: 40px
  height: 40px
  display: inline-flex
  align-items: center
  justify-content: center
  border-radius: 6px

.text-center
  text-align: center
  font-weight: 600
  color: var(--color-text)

.skill-mod.badge
  display: inline-block
  min-width: 48px
  padding: 6px 8px
  text-align: center
  border-radius: 8px
  border: 1px solid var(--color-border-highlight)
  font-variant-numeric: tabular-nums

</style>
