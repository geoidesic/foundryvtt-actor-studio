<script>
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import IconSearchSelect from "~/src/components/atoms/select/IconSearchSelect.svelte";
  import { writable } from "svelte/store";

  // Placeholder stores; real data will be wired to the features index worker
  let options = [];
  let active = null;
  let value = null;
  let placeHolder = "Search features...";

  export let selectedFeatures = writable([]);

  function handleSelect(option) {
    // Placeholder: push to selectedFeatures list if not present
    selectedFeatures.update((list) => {
      if (!list.find((x) => x.value === option)) {
        return [...list, { value: option, label: option }];
      }
      return list;
    });
    return true;
  }
</script>

<template lang="pug">
StandardTabLayout(title="Features" showTitle="true" tabName="npc-features")
  div(slot="left")
    IconSearchSelect.icon-select({options} {active} {placeHolder} handler="{handleSelect}" id="npc-features-select" bind:value)
  div(slot="right")
    h3 Selected Features (staged)
    ul
      +each("$selectedFeatures as f")
        li {f.label}
</template>

<style lang="sass">
</style>

