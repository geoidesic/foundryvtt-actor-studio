<script>
  // TODO: Implement UI for prompt, generate, preview, accept, and Fix Scale slider
  export let actor;
  import { generateImageFromPrompt } from "~/src/helpers/aiImage";
  import { writable, get as getStore } from 'svelte/store';
  import { getContext } from 'svelte';
  import { localize as t, safeGetSetting } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { biographyContent, generateBiography } from '~/src/stores/biography';
  import LLM from '~/src/plugins/llm';
  import { discoverOpenRouterImageModels } from '~/src/helpers/aiImage';

  const preview = writable(null);
  let loading = false;
  let scale = 1.0;
  let diagnostic = null;
  const provider = safeGetSetting(MODULE_ID, 'llmProvider', 'openai');
  const resolvedBaseUrl = LLM.getBaseUrl();

  // If actor isn't provided as a prop, get it from context (consistent with other components)
  const ctxActor = getContext('#doc');
  const activeActor = actor || ctxActor;

  let discovering = false;
  let discoveredModels = null;
  let selectedModel = null;

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
    // Save to settings and retry generate
    try {
      await game.settings.set(MODULE_ID, 'openrouterImageModel', selectedModel);
      ui.notifications.info(`Saved OpenRouter image model: ${selectedModel}. Retrying generation...`);
      await onGenerate();
    } catch (e) {
      ui.notifications.error(`Failed to save model: ${e.message}`);
    }
  }

  async function onGenerate() {
    loading = true;
    try {
      // Use existing llm settings via safeGetSetting
      const apiKey = safeGetSetting(MODULE_ID, 'llmApiKey', '');
      const provider = safeGetSetting(MODULE_ID, 'llmProvider', 'openai');
      if (!apiKey) {
        ui.notifications.warn('LLM API key not configured (llmApiKey). Please set it in Module Settings → Actor Studio.');
        return;
      }
      if (provider !== 'openrouter') ui.notifications.info(`LLM provider is set to ${provider}; images will use OpenRouter when provider is 'openrouter'.`);

      // Use the same biography text that the biography generator would use.
      let prompt = getStore(biographyContent)?.biography;
      if (!prompt || prompt.trim().length < 20) {
        // If biography is not present or short, auto-generate it using the existing flow
        ui.notifications.info('Generating a quick biography to use as the image prompt...');
        try {
          await generateBiography(activeActor);
        } catch (err) {
          console.error('Biography generation failed', err);
          diagnostic = { message: err.message, provider, baseUrl: resolvedBaseUrl };
          ui.notifications.error('Biography generation failed; see diagnostics below.');
          return;
        }
        prompt = getStore(biographyContent)?.biography;
      }

      if (resolvedBaseUrl && String(resolvedBaseUrl).includes('undefined')) {
        diagnostic = { message: 'Resolved baseUrl contains "undefined" — check module settings or your local proxy configuration', provider, baseUrl: resolvedBaseUrl };
        ui.notifications.error('LLM base URL appears invalid; see diagnostics below.');
        return;
      }

      if (!prompt || prompt.trim().length === 0) {
        prompt = "Portrait of a fantasy character";
      }

          try {
        diagnostic = null;
        const res = await generateImageFromPrompt(prompt, { preferAlpha: true });
        // Attach prompt for later metadata
        res.prompt = prompt;
        preview.set(res);
      } catch (err) {
        console.error('Image generation failed', err);
        // Structured diagnostic data for UI and copy/paste
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
    // Avoid fetch on data: URLs which can be unreliable in some embed contexts; decode base64 manually
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

      // Optionally call Tokenizer if available to auto-mask
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

      // Update actor (portrait and prototype token with ring)
      await actor.update({ img: finalPath, prototypeToken: { texture: { src: finalPath }, ring: { enabled: true, subject: { texture: finalPath, scale: Number(scale) } } } });

      // Store metadata in flags
      const existing = await actor.getFlag('actor-studio', 'aiPortraits') || [];
      await actor.setFlag('actor-studio', 'aiPortraits', [...existing, { path: finalPath, prompt: current.prompt || '', ts: Date.now() }]);

      ui.notifications.info('AI portrait saved and token updated.');
    } catch (err) {
      console.error(err);
      ui.notifications.error(`AI portrait save failed: ${err.message}`);
    } finally {
      loading = false;
    }
  }
</script>

<div class="ai-portrait-panel">
  <h4>{t('AI.Portrait.Title')}</h4>
  <div class="controls">
    <button on:click={onGenerate} disabled={loading}>{t('AI.Portrait.Generate')}</button>
    <button on:click={onAccept} disabled={$preview === null}>{t('AI.Portrait.Accept')}</button>
  </div>
  <div class="preview">
    {#if $preview}
      <img src={$preview.dataUrl} alt="AI preview" style="width:128px;height:128px;object-fit:cover; transform:scale({scale});"/>
    {/if}
  </div>

  {#if diagnostic}
    <div class="diagnostic">
      <strong>⚠️ Diagnostic</strong>
      <div><em>Provider:</em> {diagnostic.provider || provider}</div>
      <div><em>Resolved baseUrl:</em> {diagnostic.baseUrl || resolvedBaseUrl}</div>
      <div><em>Endpoint:</em> {diagnostic.endpoint || 'N/A'}</div>
      <div><em>Status:</em> {diagnostic.status || 'N/A'} {diagnostic.statusText ? `- ${diagnostic.statusText}` : ''}</div>
      <div><em>Error:</em> {diagnostic.message}</div>

      {#if diagnostic.status === 405}
        <div class="diag-suggestion"><em>Suggestion:</em> Received 405 Method Not Allowed when calling the image endpoint. OpenRouter does not expose this image endpoint; either (1) use a provider with an images API (e.g., OpenAI or Stability) or (2) run a small local image-capable proxy and set the module setting `llmBaseUrl` to its API base (e.g., <code>http://localhost:3000/api</code>). If you're not running a proxy, try switching the LLM provider or deploying/starting `actor-studio-openai` with image support.</div>
      {/if}

      {#if diagnostic.status === 404}
        <div class="diag-suggestion"><em>Suggestion:</em> Received 404 Not Found from the OpenRouter generation endpoint. Try setting the module setting <code>openrouterImageModel</code> to a known image model (e.g., <code>bytedance-seed/seedream-4.5</code> or <code>openai/gpt-5-image</code>) and ensure your <strong>OpenRouter API Key</strong> is present in settings. If you still get 404, your OpenRouter account may not have image-generation enabled or the model id may be unavailable—consider using a different provider or running a local proxy that exposes an image endpoint.</div>
        <div class="diag-actions-extended">
          <button on:click={discoverModels} disabled={discovering}>{discovering ? 'Discovering...' : 'Discover image models'}</button>
        </div>

        {#if discoveredModels}
          <div class="model-list">
            <label>Select a model to try:</label>
            <select bind:value={selectedModel}>
              {#each discoveredModels as m}
                <option value={m}>{m}</option>
              {/each}
            </select>
            <div class="diag-actions-extended">
              <button on:click={saveAndRetry} disabled={!selectedModel || loading}>Save & Retry</button>
            </div>
          </div>
        {/if}
      {/if}

      <!-- Selectable/copyable diagnostic payload -->
      <div class="diag-copy">
        <label>Diagnostic details (select to copy):</label>
        <textarea readonly rows="6">{JSON.stringify(diagnostic, null, 2)}</textarea>
        <div class="diag-actions">
          <button on:click={() => navigator.clipboard?.writeText(JSON.stringify(diagnostic, null, 2))}>{t('AI.Portrait.Copy') || 'Copy Diagnostic'}</button>
          <button on:click={onGenerate} disabled={loading}>{t('AI.Portrait.Retry') || 'Retry'}</button>
        </div>
      </div>
    </div>
  {/if}

  <label>Fix Scale <input type="range" min="0.7" max="1.3" step="0.01" bind:value={scale} /></label>
</div>

<style>
.ai-portrait-panel { padding: 8px; }
.preview img { border-radius: 8px; }
.diagnostic { background: #fff6f6; border: 1px solid #f0c6c6; padding: 8px; margin-top:8px; border-radius:6px; }
.diagnostic .diag-copy textarea { width:100%; font-family: monospace; margin-top:4px; }
.diagnostic .diag-actions { display:flex; gap:8px; margin-top:6px; }
.diagnostic .diag-actions button { padding:6px 8px; }

</style>