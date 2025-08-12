<script>
  export let movement; // { walk, fly, swim, burrow, climb, units, hover }
</script>

<template lang="pug">
  .speed.label.inline
    strong Speed: 
  .value
    span
      +if("movement.walk")
        | {movement.walk} ft.
      +if("movement.fly")
        | , Fly {movement.fly} ft.{movement.hover ? ' (hover)' : ''}
      +if("movement.swim")
        | , Swim {movement.swim} ft.
      +if("movement.burrow")
        | , Burrow {movement.burrow} ft.
      +if("movement.climb")
        | , Climb {movement.climb} ft.
</template>

<style lang="scss">
.speed {
  margin: 0.5em 0;
}
</style>
