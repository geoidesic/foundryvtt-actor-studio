<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { ucfirst, resolveDnd5eConfigLabel, resolveDnd5eConfigValue } from "~/src/helpers/Utility";
  import { writable, derived } from "svelte/store";

  export let advancement = null;

  let grants = [];

  function getBaseItemUUID(identifier) {
    if (!identifier) {
      return null;
    }
    window.GAS.log.d("identifier", identifier);
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
        return { all: false, label: split[2], value: split[1], type: split[0] };
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
    // window.GAS.log.d('Item', itemObj);
    item.set(itemObj);
  };

  const getConfig = () => game?.system?.config || CONFIG?.DND5E || {};

  const getToolDisplayValue = (key) => {
    const config = getConfig();
    return resolveDnd5eConfigLabel([config.toolProficiencies, config.toolTypes], key, "tool") || "";
  };

  const getArmorDisplayValue = (key) => {
    const config = getConfig();
    return resolveDnd5eConfigLabel([config.armorProficiencies, config.armorTypes], key) || "";
  };

  const getWeaponDisplayValue = (key) => {
    const config = getConfig();
    return resolveDnd5eConfigLabel([config.weaponProficiencies, config.weaponTypes], key) || "";
  };

  const processGrant = async (grant) => {
    const split = grant.split(":");
    // window.GAS.log.d('Trait split', split);
    // window.GAS.log.d('switch', split[0]);
    switch (split[0]) {
      case "languages":
        return { label: ucfirst(split[1]), value: ucfirst(split[2]) };
      case "tool":
        if(split[2]) {
          return { label: ucfirst(split[2]), value: getToolDisplayValue(split[1]) || null };
        } else {
          const toolDisplay = getToolDisplayValue(split[1]);
          const toolId = resolveDnd5eConfigValue(CONFIG?.DND5E?.toolIds, split[1], "tool");
          const uuid = getBaseItemUUID(toolId);
          await fetchAndSetItem(uuid);
          let fetchedItem;
          item.subscribe(value => {
            fetchedItem = value;
          })();
          const label = fetchedItem?.name || toolDisplay || ucfirst(split[1]);
          const value = fetchedItem?.name ? (toolDisplay || null) : null;
          return { label, value };
        }
      case "saves":
        return { label: game.system.config.abilities[split[1]].label, value: null };
      case "armor":
        return { label: getArmorDisplayValue(split[1]) || ucfirst(split[1]), value: null };
      case "weapon":
        if(split[2]) {
          return { label: ucfirst(split[2]), value: getWeaponDisplayValue(split[1]) || null };
        } else {
          return { label: getWeaponDisplayValue(split[1]) || ucfirst(split[1]), value: null };
        }
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
    // window.GAS.log.d("Trait config", advancement.configuration);
    // window.GAS.log.d("Trait config", advancement.configuration);
    // window.GAS.log.d("Trait grants", advancement.configuration.grants);
    const grantPromises = Array.from(advancement.configuration.grants).map(processGrant);
    grants = await Promise.all(grantPromises);
    // window.GAS.log.d('Grants', grants);
  };

  onMount(async () => {
    // window.GAS.log.d("Advancement", advancement);
    if (advancement.configuration.grants.size > 0) {
      await initializeGrants();
    }
  });
</script>


<template lang="pug">
  .advancement.mt-sm(data-type="{advancement.type}")
    
    //- pre {JSON.stringify(advancement)}

    +if("grants.length > 0")
      +each("grants as grant")
        .flexrow
          .flex.left {grant.label}
          +if("grant.value")
            .flex0.right.badge.inset.nowrap {grant.value}

    //- pre choices {JSON.stringify(choices)}
    
    +if("choices.length > 0")
      +each("choices as choice")

        //- pre choice {JSON.stringify(choice)}
        //- pre choice.pool {JSON.stringify(choice.pool)}


        +if("!fromAll(choice.pool)")
          .flexrow
            h4.flex
              span Choose&nbsp;
              span &nbsp;{choice.count}&nbsp; 
              span of the following:

          //- pre choice.pool {JSON.stringify(choice.pool)}
          
          +each("choice.pool as pool")
            
            //- pre {JSON.stringify(pool)}

            .flexrow
              .flex.left {pool.label}
              +if("pool.value")
                +if("pool.type == 'tool'")
                  +if("getToolDisplayValue(pool.value)")
                    .flex0.right.badge.inset.nowrap {getToolDisplayValue(pool.value)}
                
                  +else()
                    .flex0.right.badge.inset {ucfirst(pool.value)}
          +else()
            .flexrow
              .flex 
                span Choose&nbsp;
                span {choice.count} 
              .flex0.badge.inset.right any
  
  </template>
  
  <style lang="sass">
  @import "../../../../../styles/Mixins.sass"
  .inset
    @include inset
  .advancement
    @include inset

    .badge.inset
      @include badge()
      @include inset

</style>