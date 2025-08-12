<script>
  export let hp; // { value, max, temp, tempmax, formula }
</script>

<template lang="pug">
  .hit-points
    .label.inline
      strong Hit Points  
    .value {hp.max} [{hp.formula}]
    +if("hp.temp")
      span &nbsp;Temp: {hp.temp}/{hp.tempmax}
</template>

<style lang="scss">
.hit-points {
  margin: 0.5em 0;
}
</style>
