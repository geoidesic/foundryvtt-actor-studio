<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { ucfirst } from "~/src/helpers/Utility";
  import { writable, derived } from "svelte/store";
  import { log } from "~/src/helpers/Utility";

  export let advancement = null;

  let grants = [];

  function getBaseItemUUID(identifier) {
    if (!identifier) {
      console.trace();
      return null;
    }
    log.d("identifier", identifier);
    let pack = CONFIG.DND5E.sourcePacks.ITEMS;
    let [scope, collection, id] = identifier.split(".");
    if (scope && collection) pack = `${scope}.${collection}`;
    if (!id) id = identifier;
    return `Compendium.${pack}.Item.${id}`;
  }

  const morphPool = (p) => {
    const arr = Array.from(p);
    const nuarr = arr.map((x) => {
      const split = x.split(":");
      if (split[2]) {
        return { all: false, label: split[2], value: split[1] };
      }
      return { all: true, label: split[0], value: split[1] };
    });
    return nuarr;
  };

  const fromAll = (p) => {
    return p.some((x) => {
      return x.all;
    });
  };

  let choices = advancement.configuration.choices.map((c) => {
    return {
      count: c.count,
      pool: morphPool(c.pool),
    };
  });

  const item = writable(null);

  const fetchAndSetItem = async (uuid) => {
    const itemObj = await fromUuid(uuid);
    log.d('Item', itemObj);
    item.set(itemObj);
  };

  const processGrant = async (grant) => {
    const split = grant.split(":");
    log.d('Trait split', split);
    log.d('switch', split[0]);
    switch (split[0]) {
      case "languages":
        return { label: ucfirst(split[1]), value: split[2] };
      case "tool":
        const uuid = getBaseItemUUID(CONFIG.DND5E.toolIds[split[1]]);
        await fetchAndSetItem(uuid);
        let fetchedItem;
        item.subscribe(value => {
          fetchedItem = value;
        })();
        return { label: fetchedItem?.name, value: split[1] };
      case "saves":
        return { label: game.system.config.abilities[split[1]].label, value: null };
      case "armor":
        return { label: game.system.config.armorProficiencies[split[1]], value: null };
      case "weapon":
        return { label: ucfirst(split[2]), value: game.system.config.weaponProficiencies[split[1]] };
      case 'dr':
        return { label: game.system.config.damageTypes[split[1]].label, value: split[1] };
      default:
        return {
          label: game.system.config[split[0]][split[1]].label,
          value: "",
        };
    }
  };

  const initializeGrants = async () => {
    log.d(advancement.configuration.grants)
    const grantPromises = Array.from(advancement.configuration.grants).map(processGrant);
    grants = await Promise.all(grantPromises);
    log.d('Grants', grants);
  };

  onMount(async () => {
    log.d("Advancement", advancement);
    if (advancement.configuration.grants.size > 0) {
      await initializeGrants();
    }
  });
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
              span Choose&nbsp;
              span &nbsp;{choice.count}&nbsp; 
              span of the following:
          +each("choice.pool as pool")
            .flexrow
              .flex.left {pool.label}
              +if("pool.value")
                .flex0.right.badge.inset {pool.value}
          +else()
            .flexrow
              .flex 
                span Choose&nbsp;
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