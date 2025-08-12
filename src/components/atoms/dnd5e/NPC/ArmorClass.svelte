<script>
  export let ac;
</script>

<template lang="pug">
  .armor-class
    .label AC: 
      span {ac.value}
    //- +if("calc")
    //-   span &nbsp;({calc})
</template>

<style lang="scss">
.armor-class {
  margin: 0.5em 0;
}
</style>
