<script>
  export let actor;
  import { writable, get as getStore } from 'svelte/store';
  import { getContext, onMount, onDestroy } from 'svelte';
  import { localize as t, safeGetSetting } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { biographyContent } from '~/src/stores/biography';
  import LLM from '~/src/plugins/llm';
  import { generateImageFromPrompt, discoverOpenRouterImageModels } from '~/src/helpers/aiImage';

  const preview = writable(null);
  let loading = false;
  let diagnostic = null;
  let promptText = '';
  const provider = safeGetSetting(MODULE_ID, 'llmProvider', 'openai');
  const resolvedBaseUrl = LLM.getBaseUrl();

  // If actor isn't provided as a prop, get it from context (consistent with other components)
  const ctxActor = getContext('#doc');
  const activeActor = actor || ctxActor;

  let discovering = false;
  let discoveredModels = null;
  let selectedModel = null;
  const handleCopyDiagnostic = () => navigator.clipboard?.writeText(JSON.stringify(diagnostic, null, 2));
  const handleCloseDiagnostic = () => (diagnostic = null);
  const portraitSettingEnabled = () => safeGetSetting(MODULE_ID, 'llmProvider', '') === 'openrouter' && safeGetSetting(MODULE_ID, 'llmApiKey', '');

  let portraitHookId;
  onMount(() => {
    portraasync () => {
    portraitHookId = Hooks.on('gas.generatePortrait', async () => {
      if (!portraitSettingEnabled()) return;
      if (loading) return;
      await onGeneratePortrait();
    });
    // Load existing portrait from actor flags
    if (activeActor) {
      const aiPortraits = await activeActor.getFlag('actor-studio', 'aiPortraits') || [];
      if (aiPortraits.length > 0) {
        const lastPortrait = aiPortraits[aiPortraits.length - 1];
        preview.set({ dataUrl: lastPortrait.dataUrl || lastPortrait.path, prompt: lastPortrait.prompt });
      }
    }

  onDestroy(() => {
    if (portraitHookId) Hooks.off('gas.generatePortrait', portraitHookId);
  });

  async function discoverModels() {
    discovering = true;
    discoveredModels = null;
    try {
      const res = await discoverOpenRouterImageModels();
      if (res.ok) {
        discoveredModels = res.models;
        if (discoveredModels && discoveredModels.length) selectedModel = discoveredModels[0];
      } else {
        diagnostic = { message: `Model discovery failed: ${res.message}`, provider, baseUrl: resolvedBaseUrl };
      }
    } catch (e) {
      diagnostic = { message: `Model discovery error: ${e.message}`, provider, baseUrl: resolvedBaseUrl };
    } finally { discovering = false; }
  }

  async function saveAndRetry() {
    if (!selectedModel) return;
    try {
      await game.settings.set(MODULE_ID, 'openrouterImageModel', selectedModel);
      ui.notifications.info(`Saved OpenRouter image model: ${selectedModel}. Retrying generation...`);
    if (cleaned.length > 0) return cleaned;
    
    // Build prompt from character details in biography store
    const bio = getStore(biographyContent);
    const parts = [];
    if (bio.race) parts.push(`${bio.race} character`);
    if (bio.characterClass) parts.push(`${bio.characterClass}`);
    if (bio.appearance) parts.push(`appearance: ${bio.appearance}`);
    if (bio.biography) parts.push(`${bio.biography.substring(0, 100)}...`);
    
    return parts.length > 0 ? parts.join(', ')
    } catch (e) {
      ui.notifications.error(`Failed to save model: ${e.message}`);
    }
  }

  async function preparePrompt() {
    const cleaned = (promptText || '').trim();
    return cleaned.length > 0 ? cleaned : 'Portrait of a fantasy character';
  }

  async function onGeneratePortrait() {
    loading = true;
    try {
      const apiKey = safeGetSetting(MODULE_ID, 'llmApiKey', '');
      const provider = safeGetSetting(MODULE_ID, 'llmProvider', 'openai');
      if (!apiKey) {
        ui.notifications.warn('LLM API key not configured (llmApiKey). Please set it in Module Settings → Actor Studio.');
        return;
      }
      if (provider !== 'openrouter') ui.notifications.info(`LLM provider is set to ${provider}; images will use OpenRouter when provider is "openrouter".`);

      if (resolvedBaseUrl && String(resolvedBaseUrl).includes('undefined')) {
        diagnostic = { message: 'Resolved baseUrl contains "undefined" — check module settings or your local proxy configuration', provider, baseUrl: resolvedBaseUrl };
        ui.notifications.error('LLM base URL appears invalid; see diagnostics below.');
        return;
      }

      const prompt = await preparePrompt();

      try {
        diagnostic = null;
        const res = await generateImageFromPrompt(prompt, { preferAlpha: true });
        res.prompt = prompt;
        preview.set(res);
      } catch (err) {
        console.error('Image generation failed', err);
        diagnostic = {
          message: err.message,
          provider,
          baseUrl: resolvedBaseUrl,
          endpoint: err.endpoint || null,
          status: err.status || null,
          statusText: err.statusText || null,
          response: err.responseText || (err.cause && err.cause.message) || null,
          attempts: err.attempts || null
        };
        ui.notifications.error(`Image generation failed: ${err.message}. See diagnostics below.`);
      }
    } finally { loading = false; }
  }

  import { get } from 'svelte/store';

  async function dataUrlToFile(dataUrl, filename = `ai-portrait-${Date.now()}.png`) {
    const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
    if (!match) throw new Error('Invalid data URL');
    const mime = match[1] || 'image/png';
    const b64 = match[2];
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    return new File([blob], filename, { type: mime });
  }

  async function onAccept() {
    loading = true;
    try {
      const current = get(preview);
      if (!current?.dataUrl) {
        ui.notifications.warn('No preview available to save.');
        return;
      }

      if (!actor || !actor.id) throw new Error('Actor not available');

      const file = await dataUrlToFile(current.dataUrl, `ai-portrait-${actor.id}-${Date.now()}.png`);
      const folder = `worlds/${game.world.name}/actor-studio/${actor.id}`;
      const uploadRes = await FilePicker.implementation.upload('data', folder, file, {}, { notify: true });
      const savedPath = uploadRes.files?.[0];
      if (!savedPath) throw new Error('Upload failed');

      let finalPath = savedPath;
      const tokenizerApi = game.modules.get('tokenizer')?.api;
      if (tokenizerApi?.autoToken) {
        try {
          const tokenResult = await tokenizerApi.autoToken({ image: savedPath, actor, options: {} });
          if (tokenResult?.tokenPath) finalPath = tokenResult.tokenPath;
        } catch (err) {
          console.warn('Tokenizer autoToken failed', err);
        }
      }

      await actor.update({ img: finalPath, prototypeToken: { texture: { src: finalPath } } });

      const existing = await actor.getFlag('actor-studio', 'aiPortraits') || [];
      await actor.setFlag('actor-studio', 'aiPortraits', [...existing, { path: finalPath, dataUrl: current.dataUrl, prompt: current.prompt || '', ts: Date.now() }]);

      ui.notifications.info('AI portrait saved and token updated.');
    } catch (err) {
      console.error(err);
      ui.notifications.error(`AI portrait save failed: ${err.message}`);
    } finally {
      loading = false;
    }
  }
</script>

<template lang="pug">
.ai-portrait-panel
  .panel-header
    h4 {t('AI.Portrait.Title') || 'AI Portrait'}
    p.panel-subtitle Generate a portrait image from character details.

  .prompt-section
    textarea#ai-portrait-prompt(rows="3" placeholder="Custom prompt (optional). Leave blank to auto-generate from biography." bind:value!="{promptText}")

  +if("$preview")
    .preview-section
      .preview-image
        img(src!="{$preview.dataUrl}" alt="AI preview")
      .preview-controls
        button(on:click!="{onAccept}" disabled!="{!$preview}") Accept & Save

  +if("diagnostic")
    .diagnostic-section
      .diagnostic-header
        strong ⚠️ Generation Failed
        button.btn-close(type="button" on:click!="{handleCloseDiagnostic}") ✕

      .diagnostic-details
        .detail-row
          span.label Provider:
          span.value {diagnostic.provider || provider}
        .detail-row
          span.label Error:
          span.value {diagnostic.message}
        +if("diagnostic.status")
          .detail-row
            span.label Status:
            span.value {diagnostic.status} {diagnostic.statusText || ''}

      +if("diagnostic.status === 404")
        .suggestion-box
          p
            strong Tip:
            |  The endpoint wasn't found. Try discovering available image models below.
          button(on:click!="{discoverModels}" disabled!="{discovering}") {discovering ? 'Discovering...' : 'Discover Models'}

          +if("discoveredModels")
            .model-selector
              label Select a model:
              select(bind:value!="{selectedModel}")
                +each("discoveredModels as m")
                  option(value!="{m}") {m}
              button(on:click!="{saveAndRetry}" disabled!="{!selectedModel || loading}") Save & Retry

      +if("diagnostic.status === 405")
        .suggestion-box
          p
            strong Tip:
            |  Method not allowed. This provider may not support image generation via the current endpoint. Check your LLM provider settings.

      .diagnostic-actions
        button(on:click!="{handleCopyDiagnostic}") Copy Details
        button(on:click!="{onGeneratePortrait}" disabled!="{loading}") Retry
</template>

<style>
  .ai-portrait-panel {
    padding: 16px;
    background: var(--color-bg-dark-primary);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .panel-header {
    margin-bottom: 8px;
  }

  .panel-header h4 {
    margin: 0 0 4px 0;
    font-size: 1.2rem;
    color: var(--color-text-dark-primary);
  }

  .panel-subtitle {
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-text-dark-secondary);
  }

  .prompt-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .prompt-section textarea {
    width: 100%;
    min-height: 80px;
    padding: 8px;
    border: 1px solid var(--color-border-light);
    border-radius: 6px;
    background: var(--color-bg-dark-secondary);
    color: var(--color-text-dark-primary);
    font-family: inherit;
    font-size: 0.9rem;
    resize: vertical;
  }

  .prompt-section textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
  }

  .button-group {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 8px;
  }

  .btn-primary,
  .btn-secondary,
  .btn-success,
  .btn-tertiary,
  .btn-close {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--color-border-light);
    background: var(--color-bg-dark-secondary);
    color: var(--color-text-dark-primary);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-light);
    box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
  }

  .btn-secondary {
    background: var(--color-bg-dark-secondary);
    border: 1px solid var(--color-border-light);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-bg-dark-tertiary);
    border-color: var(--color-primary);
  }

  .btn-success {
    background: var(--dnd5e-color-gold);
    color: #000;
    border-color: var(--dnd5e-color-gold);
  }

  .btn-success:hover:not(:disabled) {
    background: var(--dnd5e-color-gold-light);
  }

  .btn-tertiary {
    padding: 6px 10px;
    font-size: 0.85rem;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preview-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    padding: 12px;
    background: var(--color-bg-dark-secondary);
    border-radius: 6px;
  }

  .preview-image {
    width: 100%;
    max-width: 300px;
  }

  .preview-image img {
    width: 100%;
    height: auto;
    border-radius: 6px;
    border: 1px solid var(--color-border-light);
  }

  .preview-controls {
    width: 100%;
    max-width: 300px;
  }

  .diagnostic-section {
    padding: 12px;
    background: #fff6f6;
    border: 1px solid #f0c6c6;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .diagnostic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .diagnostic-header strong {
    color: #c41e3a;
  }

  .btn-close {
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    background: transparent;
    color: #c41e3a;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
  }

  .btn-close:hover {
    opacity: 0.7;
  }

  .diagnostic-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.9rem;
  }

  .detail-row {
    display: flex;
    gap: 8px;
  }

  .detail-row .label {
    font-weight: 600;
    min-width: 80px;
    color: #666;
  }

  .detail-row .value {
    flex: 1;
    word-break: break-word;
    color: #333;
  }

  .suggestion-box {
    padding: 10px;
    background: #fef3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .suggestion-box p {
    margin: 0;
    font-size: 0.9rem;
    color: #856404;
  }

  .model-selector {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.9rem;
  }

  .model-selector label {
    color: #666;
  }

  .model-selector select {
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #333;
  }

  .diagnostic-actions {
    display: flex;
    gap: 8px;
  }

  .diagnostic-actions button {
    padding: 6px 10px;
    font-size: 0.85rem;
  }
</style>