<script>
  export let progress;
  
  // Handle both store and plain values for progress
  let progressValue = 0;
  let normalizedProgress = 0;
  let displayProgress = 0;
  
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
  
  $: normalizedProgress = Math.max(0, Math.min(100, Number(progressValue) || 0));
  $: displayProgress = Math.round(normalizedProgress);
  
</script>
<div class="progress">
  <div class="fill" style="width: {normalizedProgress}%"></div>
  <div class="label">{displayProgress}% Complete</div>
</div>
<style lang="sass">
  @import '../../../styles/Mixins.sass'

  .progress
    position: relative
    display: block
    min-height: 1.6rem
    border-radius: 5px
    background-color: var(--gas-progress-track-background, #e0e0e0)
    overflow: hidden

  .fill
    position: absolute
    left: 0
    top: 0
    bottom: 0
    background-color: var(--gas-progress-back-background, rgba(10, 144, 50, 0.5))
    transition: width 1s linear

  .label
    position: absolute
    display: flex
    justify-content: center
    align-items: center
    left: 0
    width: 100%
    top: 0
    bottom: 0
    color: var(--gas-progress-label-color, white)
    pointer-events: none


  
</style>