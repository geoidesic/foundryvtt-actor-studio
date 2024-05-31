<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { log } from "../../../../helpers/Utility";

  export let advancement = null;

  let grants = [];


  const morphPool = (p) => {
    const arr = Array.from(p)
    const nuarr = arr.map(x => {
      const split = x.split(":")
      // log.d('split', split);
      if(split[2]) {
        return {all: false, label: split[2], value: split[1]};
      }
      return { all: true, label: split[0], value: split[1]};
    });
    return nuarr
  }

  const fromAll = (p) => {
    log.d(p);
    return p.some(x => {
      return x.all
    })
  }

  let choices = advancement.configuration.choices.map(c => {
    return {
      count: c.count,
      pool: morphPool(c.pool)
    }
  });


  $: if (advancement.configuration.grants.size > 0) {
    grants = Array.from(advancement.configuration.grants).map((grant) => {
      const split = grant.split(":");
      // log.d('Trait split', split);
      switch (split[0]) {
        case "languages":
        case "tool":
          return { label: split[2], value: split[1] };
          
        case "saves":
          return { label: game.system.config.abilities[split[1]].label, value: null };

        case "armor":
          return {label: game.system.config.armorProficiencies[split[1]], value: null};
          

        case "weapon":
          return {label: game.system.config.weaponProficiencies[split[1]], value: null};
          
        default:
          return {
            label: game.system.config[split[0]][split[1]].label,
            value: "",
          };
      }
    });
  }
</script>

<template lang="pug">
  .advancement.mt-sm(data-type="{advancement.type}")
    +if("grants.length > 0")
      +each("grants as grant")
        .flexrow
          .flex.left {grant.label}
          +if("grant.value")
            .flex0.right.badge.inset {grant.value}
  
    +if("choices.length > 0")
      +each("choices as choice")
        +if("!fromAll(choice.pool)")
          .flexrow
            .flex 
              span Choose 
              span {choice.count} 
              span of the following:
          +each("choice.pool as pool")
            .flexrow
              .flex.left {pool.label}
              +if("pool.value")
                .flex0.right.badge.inset {pool.value}
          +else()
            .flexrow
              .flex 
                span Choose 
                span {choice.count} 
              .flex0.badge.inset.right any
  
  </template>
  
  <style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset

    .badge.inset
      @include badge()
      @include inset

</style>