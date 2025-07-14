<script>
  import { onMount } from "svelte";

  export let progress;
  
  // Handle both store and plain values for progress
  let progressValue = 0;
  
  $: {
    if (typeof progress === 'object' && progress?.subscribe) {
      // It's a store - subscribe to get the value
      progress.subscribe(value => {
        progressValue = value;
      });
    } else {
      // It's a plain value - use directly
      progressValue = progress;
    }
  }
  
  $: cssClass = progressValue == 0 ? "center" : "";
  
</script>
<div class="progress">
  <div class="back">{progressValue}% Complete</div>
  <div class="front" style="clip-path: inset(0 0 0 {progressValue}%); -webkit-clip-path: inset(0 0 0 {progressValue}%);">{progressValue}% Complete</div>
</div>
<style lang="sass">
  @import '../../../styles/Mixins.sass'

  .progress
    position: relative
    display: flex
    border-radius: 5px
    background-color: #e0e0e0
    overflow: hidden

  .back
    display: flex
    justify-content: center
    align-items: center
    width: 100%
    background-color: rgba(10, 144, 50, 0.5)
    color: white

  .front
    position: absolute
    display: flex
    justify-content: center
    align-items: center
    left: 0
    right: 0
    top: 0
    bottom: 0
    background: white
    color: black
    transition: clip-path 1s linear


  
</style>