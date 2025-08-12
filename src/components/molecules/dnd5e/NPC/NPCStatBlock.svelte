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
    'sm': 'Small'
  }

  // For svelte-preprocess pug: precompute ability scores for template
  $: abilityScores = abilityOrder.map(abbr => ({
    abbr,
    score: npc?.system?.abilities?.[abbr]?.value
  }));
</script>

<template lang="pug">
  .npc-stat-block
    h2.name {name}
    .details
      span.mr-sm {sizes[npc?.system?.traits?.size] || ucfirst(npc?.system?.traits?.size)},
      span.mr-sm {ucfirst(npc?.system?.details?.type?.value)},
      span.mr-sm {npc?.system?.details?.alignment}
    .label.inline Armor Class 
    .value {npc?.system?.attributes?.ac.flat}
    HitPoints(hp="{npc?.system?.attributes?.hp}")
    .mb-sm
      Speed(movement="{npc?.system?.attributes?.movement}")
    hr
    .abilities
      +each("abilityScores as ab")
        AttributeScore(abbreviation="{ab.abbr}" score="{ab.score}")
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
</style>