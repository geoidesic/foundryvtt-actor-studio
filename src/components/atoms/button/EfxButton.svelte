<script>
  import preventDefault from "~/helpers/svelte-actions/PreventDefault.js";
  import { ripple } from "@typhonjs-fvtt/standard/action/animate/composable";

  export let efx = ripple();
  export let disabled = false;
</script>

<button class="parchment-button" on:click on:mousedown={preventDefault} use:efx {disabled}>
  <i class="fas fa-dice" />
  <slot />
</button>

<style lang="scss">
  @import "../../../styles/Mixins.scss";

  // button {
  // @include button;
  // position: relative;
  // overflow: hidden;
  // clip-path: var(--tjs-icon-button-clip-path, none);
  // transform-style: preserve-3d;
  // width: 100%;
  // height: 100%;

  // :hover {
  //   &:not(:disabled) {
  //     clip-path: var(--tjs-icon-button-clip-path-hover, var(--tjs-icon-button-clip-path, none));
  //   }
  // }
  // }

  .fa-dice {
    margin-top: 0.4rem;
  }

  button.parchment-button {
    display: inline-flex;
    position: relative;
    background: url("ui/parchment.jpg") no-repeat center/cover;
    color: #634b33;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.2s, background-color 0.2s;
  }

  button.parchment-button:hover {
    transform: translateY(-2px);
    background-color: #f0e3cc;
    border-color: #9c855e;
  }

  button.parchment-button:active:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(45deg, transparent 10%, #000 30%, transparent 50%, #000 70%, transparent 90%);
    opacity: 0.1;
    pointer-events: none;
    animation: crinkle 0.5s ease-in-out;
    transform: translateX(calc(-10% + 20% * var(--random-x))) rotate(calc(-5deg + 10deg * var(--random-rotation)));
  }

  @keyframes crinkle {
    0%,
    100% {
      --random-x: 0;
      --random-rotation: 0;
    }
    25% {
      --random-x: 1;
      --random-rotation: 1;
    }
    50% {
      --random-x: -1;
      --random-rotation: -1;
    }
    75% {
      --random-x: 1;
      --random-rotation: 0;
    }
  }

  /* Initial random position and rotation for each button */
  button.parchment-button:nth-child(odd) {
    --random-x: -0.5;
    --random-rotation: -2;
  }

  button.parchment-button:nth-child(even) {
    --random-x: 0.5;
    --random-rotation: 2;
  }
</style>
