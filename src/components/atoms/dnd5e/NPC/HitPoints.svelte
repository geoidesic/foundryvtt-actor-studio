<script>
  export let hp; // { value, max, temp, tempmax, formula }
  import { enrichHTML } from "~/src/helpers/Utility";

</script>

<template lang="pug">
  .hit-points
    .label.inline
      strong Hit Points  
    +await("enrichHTML(`[[/r ${hp.formula}]]`)")
      +then("Html")
        .value {hp.max} {@html Html}
    +if("hp.temp")
      span &nbsp;Temp: {hp.temp}/{hp.tempmax}
</template>

<style lang="scss">
.hit-points {
  margin: 0.5em 0;
}
</style>