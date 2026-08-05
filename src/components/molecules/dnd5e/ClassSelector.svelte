<script>
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import { localize as t } from "~/src/helpers/Utility";

  export let active = null;
  export let options = [];
  export let value = null;
  export let handler;
  export let disabled = false;

  const placeHolder = t('Tabs.Classes.Placeholder');
</script>

<template lang="pug">
.flexrow
  .flex0.required(class="{active ? '' : 'active'}") *
  .flex3
    IconSelect.icon-select(
      active="{active}"
      options="{options}"
      placeHolder="{placeHolder}"
      groupBy="{['sourceBook','packLabel']}"
      handler="{handler}"
      id="characterClass-select"
      bind:value="{value}"
      disabled="{disabled}"
    )
</template>
