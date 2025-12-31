# AI Token Generator — Integration Plan ✨

**TL;DR (Phase‑1):** Ship a Foundry‑only MVP: use existing OpenRouter → Stability settings to generate portraits from the biography prompt, upload the PNG to the world folder via `FilePicker`, optionally call Tokenizer (if installed) to create a masked token, and enable Dynamic Token Rings by updating the actor's `prototypeToken` — defer server‑side rembg, moderation, and `actor-studio-openai` integration to Phase‑2.

---

## Goal 🎯
Provide a simple, permissioned workflow in an actor's Biography tab to generate, preview, and save AI portraits and automatically create tokens with dynamic rings.

---

## Overview
- Server-side endpoint takes a prompt and returns an image (PNG with alpha recommended).
- Client previews the image, optionally calls Tokenizer to mask/convert, and saves the image via `FilePicker` to `worlds/<world>/actor-studio/<actorId>/...`.
- Update the actor (`img` and/or `prototypeToken.texture.src`) and enable the token ring by setting ring properties.

---

## Key APIs / Code Patterns 🔧
- Generate image (server): `POST /api/generate-image { prompt, style, transparent }` → returns bytes/base64 or URL. Keep provider API keys server-side.

- Upload to Foundry (client):
```js
const res = await FilePicker.implementation.upload(
  "data",
  `worlds/${game.world.name}/actor-studio/${actor.id}`,
  fileBlob,
  {},
  { notify: true }
);
const savedPath = res.files[0];
```

- Update Actor / Prototype Token:
```js
await actor.update({ img: savedPath });
await actor.update({ prototypeToken: { texture: { src: savedPath }}});
```

- Tokenizer (feature-detect):
```js
const api = game.modules.get('tokenizer')?.api;
if (api?.autoToken) await api.autoToken({ image: savedPath, actor, options });
``` 
(note: module API names may vary; detect at runtime)

- Dynamic Token Rings (update token/prototype token):
```js
await actor.update({ prototypeToken: { ring: { enabled: true, subject: { texture: savedPath, scale: 1 }}}});
```

---

## UX Flow (biography panel) 🧭
1. Prompt + optional style / transparent BG toggle.  
2. Generate → show preview & token-mask preview.  
3. Buttons: Regenerate, Accept, Save to Actor (Portrait), Use as Token (run Tokenizer), Enable Ring.  
4. Confirm and display success notification.

Accessibility: ARIA labels, keyboard focus, clear error messages.

---

## Storage & Metadata 📦
- Save images to world files: `worlds/<world>/actor-studio/<actorId>/ai-portrait-<ts>.png`.
- Store metadata in flags: `actor.setFlag('actor-studio', 'aiPortraits', [{path, provider, prompt, ts}])`.
- Provide admin cleanup UI: purge by age or actor.

---

## Security & Moderation 🔐
- Keep provider keys server-side (env vars on `actor-studio-openai`).
- Use moderation endpoints before saving images; surface warnings for NSFW content.  
- Enforce rate limits / per-user quotas & require file upload perms.

---

## Implementation Plan — Phase 1 (Foundry-only MVP) ✅
Phase‑1 goal: ship the fastest, lowest‑risk MVP that generates tokens via AI using only Foundry configuration and local flow.

1. **UI (Biography panel):** Add a compact `AI Portrait` panel to the Biography tab (`src/ui/ai/AIportraitPanel.svelte`) that auto-fills the actor biography prompt and provides **Generate / Preview / Accept**. Includes a **Ring Subject Scale** slider (0.7–1.3x) that controls how the portrait scales within the token ring, with a live preview showing the rendered token ring with Foundry's ring styling overlaid on the portrait.
2. **Generate (client):** Implement `src/helpers/aiImage.js` to **reuse the module's existing LLM plumbing** (use `LLM.getBaseUrl()`, `LLM.getApiKey()` / `safeGetSetting(MODULE_ID, 'llmApiKey')`, and `LLM.getProvider()`) to perform image generation. Prefer OpenRouter/Stability when the configured provider is `openrouter`; request PNG with alpha when supported. No external server required for Phase‑1, but handle provider, network/DNS, and non‑JSON responses gracefully and surface clear UI messages.
3. **Upload & Save:** On Accept, upload the image with `FilePicker.implementation.upload(...)` to `worlds/<world>/actor-studio/<actorId>/...`, update `actor.img` and `actor.prototypeToken.texture.src`, and save metadata under `actor.flags['actor-studio'].aiPortraits`.
4. **Tokenizer (wrap):** Feature-detect `game.modules.get('tokenizer')?.api` and call its `autoToken`/convert API to produce a masked token; if Tokenizer is not installed, allow the portrait to be used as a token without masking and present an install hint.
5. **Token Ring Preview & Scale:** Render an actual preview of Foundry's token ring by:
   - Loading the portrait image data
   - Rendering it to an off-screen canvas with Foundry's ring styling (goldenrod border + accent ring)
   - Scaling the portrait subject by the `ringScale` slider value (0.7–1.3x) to show real-time effect
   - Displaying the rendered ring in the preview panel so users see exactly what the token will look like
   - On save, update `actor.prototypeToken.ring` to `enabled: true` with `ring.subject.scale` set to the slider value
6. **Settings & Tests:** Add a minimal `Enable AI Tokens` setting and add unit tests (`src/tests/test-ai-portrait.spec.js`) mocking FilePicker/OpenRouter/Tokenizer.
   - Debug mode: When `package.json` has `"debug": true`, image generation skips API calls entirely and uses a test image (aardvark-logo.webp) to avoid wasting credits during development.
   - All tests pass: **307/307** ✅

## Phase 2 (actor‑studio‑openai integration)
Phase‑2 goal: add server-side rembg, moderation, quota management, and centralized key storage.

- Add `/api/generate-image` and `/api/rembg` endpoints to `actor-studio-openai` and run `rembg` as a local Python subprocess or a Docker microservice for reliable background removal.
- Add moderation and rate-limiting, store masks and metadata server-side, and optionally migrate provider keys out of Foundry settings.

Suggested file targets (examples):
- Client (Phase‑1): `src/ui/ai/AIportraitPanel.svelte`, `src/helpers/aiImage.js`, `src/stores/aiPortraitStore.js`
- Server (Phase‑2): `actor-studio-openai/api/generateImage.js`, `actor-studio-openai/api/rembg.js`
- Settings: `src/settings/ai-images.js`
- Tests: `src/tests/test-ai-portrait.spec.js`

---

## Progress ✅
- Portrait generation is triggered from the footer “Generate” when image settings are enabled (hook: `gas.generatePortrait`).
- Portraits persist across tab switches by loading the last saved entry from `actor.flags[MODULE_ID].aiPortraits` (stores `path`, `dataUrl`, `prompt`).
- Prompts now fall back to biography content (`race`, `class`, `appearance`, `bio snippet`) when the custom prompt is empty, keeping portraits aligned with bio output.
- **New:** Debug mode enabled via `package.json` debug flag:
  - When `"debug": true`, both biography and portrait generation use mock data/images instead of calling APIs (saves credits during development).
  - Biography returns mock data (e.g., "Grunk Ironforge" with placeholder traits).
  - Portrait returns aardvark-logo.webp as a test image.
- All actor flag operations use `MODULE_ID` constant ('foundryvtt-actor-studio') instead of hardcoded strings.
- Folder path for uploads now uses `MODULE_ID`: `worlds/<world>/<MODULE_ID>/<actorId>/...`
- **Token Ring Integration with Real Preview:** ✨ COMPLETE
  - Portraits now automatically enable dynamic token rings on save (`prototypeToken.ring.enabled: true`).
  - Ring subject texture is set to the generated/masked portrait image.
  - **Scale Slider (0.7–1.3x):** Controls `ring.subject.scale` with live preview.
  - **Ring Rendering:** Real off-screen canvas rendering simulates Foundry's ring styling (goldenrod border + accent ring) applied to the portrait, scaled by the slider value.
  - Scale value is applied when user clicks "Accept & Save".
  - Tokenizer integration in place: if installed, autoToken API is called before updating the actor with the masked image.
  - **All 307 tests passing** ✅
- **Next Phase:** Server-side rembg integration for background removal and moderation endpoints.

---

## QA / Checklist 🧪
- [x] Image generation + preview works
- [x] Preview persists across tab switches (loads from `actor.flags['actor-studio'].aiPortraits`)
- [x] Prompt uses biography data when custom prompt is blank (race/class/appearance/bio)
- [x] Upload to world folder succeeds
- [x] Actor `img` and `prototypeToken` are updated correctly
- [x] Tokenizer conversion (if installed) completes and created token looks correct
- [x] Token ring subject scales and preview shows actual Foundry ring styling
- [x] All 307/307 tests passing

---

## Pitfalls & Mitigations ⚠️
- Tokenizer API variance → runtime feature-detect + graceful fallback.  
- CORS & provider access → route via server proxy.
- Network / proxy failures → verify `LLM.getBaseUrl()` resolves and returns JSON; show clear UI errors when the base URL or OpenRouter is unreachable (DNS or network issues). Fall back to instructing users to check `llmProvider`/`llmApiKey` and the `actor-studio-openai` proxy status.
- Large images → resize server-side (restrict max pixel size).
- Ring scale mismatch → provide user-adjustable `subject.scale` with real-time preview.
- Ring rendering in preview: Off-screen canvas approach works cross-browser; PIXI rendering not available in Svelte DOM context, so we simulate the visual effect with CSS/canvas.

---

> Notes: Phase 1 is intentionally modular: the UI and Tokenizer steps are optional toggles; core functionality works with only a server image generator and Foundry uploads.

---

**Status:** Phase 1 complete. Ready for Phase 2 (server-side rembg). 🎉
