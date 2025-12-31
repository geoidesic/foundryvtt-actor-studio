<script>
  import { onMount, onDestroy } from 'svelte';

  let canvasEl;
  let pixiApp;
  let statusMessage = 'Initializing...';

  async function renderTokenRing() {
    const PIXI = window.PIXI;
    
    // Check canvas ready
    if (!canvas?.ready) {
      statusMessage = 'Canvas not ready';
      return;
    }

    // Get a token to work with (first controlled token or first token on canvas)
    const token = canvas.tokens?.controlled[0] || canvas.tokens?.placeables[0];
    if (!token) {
      statusMessage = 'No token found on canvas';
      return;
    }

    try {
      statusMessage = `Found token: ${token.document.name}`;
      
      // Check if token has ring mesh
      if (!token.ring) {
        statusMessage = 'Token has no ring - checking mesh...';
        console.log('Token structure:', token);
        return;
      }

      statusMessage = 'Token has ring, generating texture...';
      
      // Use the existing token's ring mesh directly
      const ringMesh = token.ring;
      
      // Generate texture from the ring mesh using canvas renderer
      const renderTexture = canvas.app.renderer.generateTexture(ringMesh, {
        resolution: 2,
        scaleMode: PIXI.SCALE_MODES.LINEAR,
        region: ringMesh.getBounds()
      });

      statusMessage = 'Creating sprite from texture...';
      
      // Create sprite from texture
      const sprite = new PIXI.Sprite(renderTexture);
      sprite.anchor.set(0.5);
      sprite.position.set(70, 70);
      
      // Scale to fit in canvas
      const scale = Math.min(140 / sprite.width, 140 / sprite.height) * 0.8;
      sprite.scale.set(scale);

      pixiApp.stage.addChild(sprite);
      statusMessage = `Token ring rendered! (${Math.round(sprite.width)}x${Math.round(sprite.height)})`;
      
    } catch (error) {
      statusMessage = `Error: ${error.message}`;
      console.error('TokenRing render error:', error);
    }
  }

  onMount(async () => {
    const PIXI = window.PIXI;
    
    pixiApp = new PIXI.Application({
      width: 140,
      height: 140,
      backgroundColor: 0x2c2c2c,
      view: canvasEl
    });

    // Render the token ring
    await renderTokenRing();
  });

  onDestroy(() => {
    if (pixiApp) {
      pixiApp.destroy(true, { children: true, texture: true, baseTexture: true });
    }
  });
</script>

<div class="pixi-poc">
  <h3>TokenRing POC</h3>
  <p class="status">{statusMessage}</p>
  <canvas bind:this={canvasEl}></canvas>
</div>

<style>
  .pixi-poc {
    padding: 16px;
    background: #222;
    border-radius: 8px;
  }

  .pixi-poc h3 {
    color: #fff;
    margin: 0 0 8px 0;
    font-size: 14px;
  }

  .pixi-poc .status {
    color: #aaa;
    margin: 0 0 8px 0;
    font-size: 12px;
    font-family: monospace;
  }
</style>
