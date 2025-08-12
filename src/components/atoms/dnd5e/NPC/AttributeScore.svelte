<script>
  export let abbreviation;
  export let score;
  const mod = Math.floor((score - 10) / 2);
  const modString = mod >= 0 ? `+${mod}` : `${mod}`;
</script>

<template lang="pug">
  .stat
    .flexcol.center
      .flex1.label {abbreviation}
      .flex1.value {score} 
      .flex1.value ({modString})
</template>

<style lang="sass">
.stat 
  .label
    font-weight: bold
    text-transform: uppercase

.stat-score 
  font-family: monospace

</style>
