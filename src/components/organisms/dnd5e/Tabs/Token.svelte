<script>
  import { getContext, onMount } from "svelte";
  import { get } from "svelte/store";
  import { biographyContent } from '~/src/stores/biography';
  import { localize as t, safeGetSetting } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { getWorkflowFSM, WORKFLOW_EVENTS } from '~/src/helpers/WorkflowStateMachine';
  import OneColumnTabLayout from "~/src/components/organisms/OneColumnTabLayout.svelte";

  export let sheet = undefined; // Accept sheet prop to avoid Svelte unknown-prop warnings
  const actor = getContext("#doc");
  const app = getContext("#external").application;
  const isDisabled = getContext('isDisabled') || false;

  // Token customization state
  // subjectScale affects only the portrait image
  let subjectScale = 1.0;
  let portraitDataUrl = null;
  let isLoadingPortrait = true;
  let tokenizerAvailable = false;
  import { aiPreview } from '~/src/stores/aiPortraitStore';
  import { workflowFSMContext } from '~/src/helpers/WorkflowStateMachine';
  let previewCanvasEl;
  let statusMessage = "Loading portrait...";

  // Subject panning (px)
  let subjectOffsetX = 0;
  let subjectOffsetY = 0;
  let dragging = false;
  let dragStart = { x: 0, y: 0 };

  // Layer controls
  let maskWithRing = true; // whether the ring masks the image
  let imageBehindRing = true; // whether image is behind or in front of ring

  // Diagnostics
  let actorPortraitCount = 0;
  let prePortraitCount = 0;
  let livePreviewExists = false;
  let lastSource = 'none';

  async function refreshDiagnostics() {
    try {
      if ($actor && $actor.getFlag) {
        const list = await $actor.getFlag(MODULE_ID, 'aiPortraits') || [];
        actorPortraitCount = list.length;
      } else {
        actorPortraitCount = 0;
      }
    } catch (e) {
      actorPortraitCount = 0;
    }

    prePortraitCount = (workflowFSMContext.preCreationPortraits || []).length || 0;
    livePreviewExists = !!get(aiPreview)?.dataUrl;

    if (actorPortraitCount) lastSource = 'actor';
    else if (prePortraitCount) lastSource = 'pre-creation';
    else if (livePreviewExists) lastSource = 'live-preview';
    else lastSource = 'none';

    window.GAS?.log?.d && window.GAS.log.d('[TOKEN] Diagnostics', { actorPortraitCount, prePortraitCount, livePreviewExists, lastSource });
  }

  // Computed labels to avoid long expressions in Pug templates
  $: subjectScaleLabel = `${subjectScale.toFixed(2)}x`;
  $: diagnosticText = `Source=${lastSource} | Actor=${actorPortraitCount} | Pre=${prePortraitCount} | LivePreview=${livePreviewExists}`;

  // Button handlers
  function handleReload() {
    loadPortrait();
    refreshDiagnostics();
  }

  // Check if Tokenizer module is available
  onMount(() => {
    tokenizerAvailable = !!game.modules.get('tokenizer')?.active;
    loadPortrait();
    // Subscribe to live aiPreview store so we update if user generates a portrait and doesn't click Accept
    const unsubscribe = aiPreview.subscribe(async value => {
      if (value && value.dataUrl && !portraitDataUrl) {
        portraitDataUrl = value.dataUrl;
        statusMessage = 'Portrait loaded (live preview subscription)';
        await renderPreview();
      }
      // Always refresh diagnostics on live preview changes
      await refreshDiagnostics();
    });
    // Initial diagnostics
    refreshDiagnostics();
    return unsubscribe;
  });

  async function loadPortrait() {
    try {
      // Get last generated portrait from actor flags
      const aiPortraits = $actor && $actor.getFlag ? await $actor.getFlag(MODULE_ID, 'aiPortraits') : null;
      if (aiPortraits && aiPortraits.length > 0) {
        const lastPortrait = aiPortraits[aiPortraits.length - 1];
        portraitDataUrl = lastPortrait.dataUrl || lastPortrait.path;
        statusMessage = "Portrait loaded";
      } else {
        // Try workflow pre-creation portraits (if actor not yet created)
        const { workflowFSMContext } = await import('~/src/helpers/WorkflowStateMachine');
        const list = workflowFSMContext.preCreationPortraits || [];
        if (list.length > 0) {
          const lastPortrait = list[list.length - 1];
          portraitDataUrl = lastPortrait.dataUrl || lastPortrait.path;
          statusMessage = 'Portrait loaded (pre-creation)';
        } else {
          // Fallback: check shared live preview store (aiPreview) for an unsaved generated portrait
          let livePreview = null;
          try {
            livePreview = get(aiPreview);
          } catch (e) {
            // ignore
          }
          if (livePreview && livePreview.dataUrl) {
            portraitDataUrl = livePreview.dataUrl;
            statusMessage = 'Portrait loaded (live preview)';
          } else {
            statusMessage = "No portrait generated yet";
          }
        }
      }
    } catch (error) {
      window.GAS.log.e('[TOKEN] Error loading portrait:', error);
      statusMessage = `Error: ${error.message}`;
    } finally {
      isLoadingPortrait = false;
      await refreshDiagnostics();
    }

    // Render preview after portrait loads
    if (portraitDataUrl) {
      await renderPreview();
    }
  }

  async function renderPreview() {
    if (!portraitDataUrl || !previewCanvasEl) {
      statusMessage = "Preview unavailable";
      return;
    }

    try {
      const canvas = previewCanvasEl;
      const ctx = canvas.getContext('2d');
      
      // Load portrait image
      const img = new Image();
      img.src = portraitDataUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaled dimensions
      const ringSize = 280;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const imageSize = ringSize;
      const ringInnerRadius = ringSize / 2;

      // Draw portrait (subjectScale + offset apply only to image)
      ctx.save();
      ctx.translate(centerX + subjectOffsetX, centerY + subjectOffsetY);
      ctx.scale(subjectScale, subjectScale);
      ctx.drawImage(img, -imageSize / 2, -imageSize / 2, imageSize, imageSize);
      ctx.restore();

      // Draw Foundry-style token ring (fixed radii)
      // Optionally mask the image to the inner circle
      if (maskWithRing) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringInnerRadius, 0, Math.PI * 2);
        ctx.clip();
        // If maskWithRing and imageBehindRing=false, we still clipped image earlier
        ctx.restore();
      }

      // Draw ring outer and inner strokes regardless of image scale
      ctx.strokeStyle = '#CDA829'; // Goldenrod
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringInnerRadius, 0, Math.PI * 2);
      if (!imageBehindRing) ctx.stroke(); // if image is in front, draw ring after image (we're currently before)

      ctx.strokeStyle = '#AA8821';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringInnerRadius + 8, 0, Math.PI * 2);
      if (!imageBehindRing) ctx.stroke();

      // If image is behind ring, draw the ring now
      if (imageBehindRing) {
        ctx.strokeStyle = '#CDA829';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringInnerRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#AA8821';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringInnerRadius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      statusMessage = `Preview updated (scale: ${subjectScale.toFixed(2)}x)`;
    } catch (error) {
      window.GAS.log.e('[TOKEN] Error rendering preview:', error);
      statusMessage = `Preview error: ${error.message}`;
    }
  }

  // Regenerate handler invoked by Footer via Hook
  async function handleRegenerateToken() {
    if (!tokenizerAvailable) {
      ui.notifications.warn("Tokenizer module not installed");
      return;
    }

    try {
      statusMessage = "Generating masked token...";
      const api = game.modules.get('tokenizer')?.api;
      if (api?.autoToken) {
        await api.autoToken({
          image: portraitDataUrl,
          actor: $actor,
          options: {}
        });
        
        // Reload portrait after Tokenizer processes it
        await loadPortrait();
        statusMessage = "Token regenerated successfully";
        ui.notifications.info('Token regenerated (masked).');
      }
    } catch (error) {
      window.GAS.log.e('[TOKEN] Error regenerating token:', error);
      statusMessage = `Tokenizer error: ${error.message}`;
      ui.notifications.error(`Failed to regenerate token: ${error.message}`);
    }
  }

  // Accept handler invoked by Footer via Hook
  async function handleAccept() {
    await handleAcceptAndSave();
  }

  // Register Hooks listeners for Regenerate and Accept
  onMount(() => {
    const regenId = Hooks.on('gas.tokenRegenerate', () => handleRegenerateToken());
    const acceptId = Hooks.on('gas.tokenAccept', () => handleAccept());
    return () => {
      Hooks.off('gas.tokenRegenerate', regenId);
      Hooks.off('gas.tokenAccept', acceptId);
    };
  });

  async function handleAcceptAndSave() {
    try {
      statusMessage = "Saving token configuration...";
      
      // Update prototype token with ring settings
      await $actor.update({
        prototypeToken: {
          ring: {
            enabled: true,
            subject: {
              scale: subjectScale,
              texture: portraitDataUrl
            }
          },
          texture: {
            src: portraitDataUrl
          }
        }
      });

      statusMessage = "Token saved successfully";
      ui.notifications.info("Token customization saved");

      // Transition to next workflow state
      const workflowFSM = getWorkflowFSM();
      if (workflowFSM) {
        workflowFSM.handle(WORKFLOW_EVENTS.TOKEN_COMPLETE);
      }
    } catch (error) {
      window.GAS.log.e('[TOKEN] Error saving token:', error);
      statusMessage = `Save error: ${error.message}`;
      ui.notifications.error(`Failed to save token: ${error.message}`);
    }
  }

  // Update preview when scale changes
  $: if (portraitDataUrl && previewCanvasEl && subjectScale) {
    renderPreview();
  }

  // Tokenizer UI text helpers (avoid long template expressions)
  $: tokenizerPrimary = tokenizerAvailable ? 'Generate a masked token using the Tokenizer module.' : '';
  $: tokenizerHint = tokenizerAvailable ? "Tokenizer regeneration is available via the footer 'Regenerate' button." : 'Tokenizer module not installed. Install it to create masked tokens.';

  // Show/hide helpers (avoid nested Pug +if/+else blocks)
  $: showLoading = isLoadingPortrait;
  $: showPreview = !isLoadingPortrait && !!portraitDataUrl;
  $: showNoPortrait = !isLoadingPortrait && !portraitDataUrl;

  $: loadingStyle = showLoading ? '' : 'display:none';
  $: previewStyle = showPreview ? '' : 'display:none';
  $: noPortraitStyle = showNoPortrait ? '' : 'display:none';
</script>

<template lang="pug">
OneColumnTabLayout(title="{t('Tabs.Token.Title')}" showTitle="{true}" tabName="token")
  div(slot="right")
    .token-customization
      h2 Token Customization
      
      // Sections are shown/hidden via computed styles to avoid nested +if/+else Pug blocks
      .loading-state(style="{loadingStyle}")
        p {statusMessage}

      // Diagnostic panel (visible in dev/debug)
      .diagnostics
        strong Debug
        span {diagnosticText}
        button(type="button" on:click="{handleReload}") Reload

      .preview-section(style="{previewStyle}")
        h3 Preview
        canvas(bind:this="{previewCanvasEl}" width="350" height="350")
        p.status-message {statusMessage}

      .controls-section(style="{previewStyle}")
        h3 Subject Controls
        .scale-control
          label(for="subject-scale-slider") Subject scale: {subjectScaleLabel}
          input#subject-scale-slider(
            type="range"
            min="0.7"
            max="1.3"
            step="0.05"
            bind:value="{subjectScale}"
            disabled="{isDisabled}"
          )
          .scale-labels
            span 0.7x
            span 1.0x
            span 1.3x
        .pan-control
          p Drag inside the preview to reposition the subject
        .layer-controls
          label
            input(type="checkbox" bind:checked="{maskWithRing}")
            | Mask with ring
          label
            input(type="checkbox" bind:checked="{imageBehindRing}")
            | Image behind ring

      .tokenizer-section(style="{previewStyle}")
        h3 Tokenizer Integration
        p {tokenizerPrimary}
        p.hint {tokenizerHint}

      .actions-section(style="{previewStyle}")
        p.hint Use the footer controls to Regenerate or Accept & Save the token configuration.

      .no-portrait-state(style="{noPortraitStyle}")
        p No portrait available. Please generate a portrait in the Biography tab first.
</template>

<style lang="sass" scoped>
.token-customization
  padding: 20px

h2
  margin: 0 0 20px 0
  color: var(--color-text-dark-primary)

h3
  margin: 20px 0 10px 0
  font-size: 16px
  color: var(--color-text-dark-secondary)

.loading-state, .no-portrait-state
  text-align: center
  padding: 40px
  color: var(--color-text-dark-secondary)

.preview-section
  margin-bottom: 30px
  canvas
    display: block
    margin: 0 auto
    border: 2px solid var(--color-border-dark)
    border-radius: 8px
    background: #2c2c2c

.status-message
  text-align: center
  font-size: 12px
  color: var(--color-text-dark-secondary)
  margin-top: 10px

.controls-section
  margin-bottom: 30px

.scale-control
  label
    display: block
    margin-bottom: 10px
    font-weight: bold

  input[type="range"]
    width: 100%
    margin-bottom: 5px

  .scale-labels
    display: flex
    justify-content: space-between
    font-size: 12px
    color: var(--color-text-dark-secondary)

.tokenizer-section
  margin-bottom: 30px
  p
    margin-bottom: 10px

  .hint
    font-style: italic
    color: var(--color-text-dark-secondary)

.regenerate-button, .accept-button
  padding: 10px 20px
  font-size: 14px
  border-radius: 4px
  cursor: pointer
  border: none
  
  &:disabled
    opacity: 0.5
    cursor: not-allowed

.regenerate-button
  background: var(--color-button-secondary)
  color: var(--color-text-light-primary)
  
  &:hover:not(:disabled)
    background: var(--color-button-secondary-hover)

.accept-button
  background: var(--color-button-primary)
  color: var(--color-text-light-primary)
  font-weight: bold
  
  &:hover:not(:disabled)
    background: var(--color-button-primary-hover)

.actions-section
  text-align: center
</style>
