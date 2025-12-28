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

1. **UI (Biography panel):** Add a compact `AI Portrait` panel to the Biography tab (`src/ui/ai/AIportraitPanel.svelte`) that auto-fills the actor biography prompt and provides **Generate / Preview / Accept** and a small **Fix Scale** slider.
2. **Generate (client):** Implement `src/helpers/aiImage.js` to **reuse the module's existing LLM plumbing** (use `LLM.getBaseUrl()`, `LLM.getApiKey()` / `safeGetSetting(MODULE_ID, 'llmApiKey')`, and `LLM.getProvider()`) to perform image generation. Prefer OpenRouter/Stability when the configured provider is `openrouter`; request PNG with alpha when supported. No external server required for Phase‑1, but handle provider, network/DNS, and non‑JSON responses gracefully and surface clear UI messages.
3. **Upload & Save:** On Accept, upload the image with `FilePicker.implementation.upload(...)` to `worlds/<world>/actor-studio/<actorId>/...`, update `actor.img` and `actor.prototypeToken.texture.src`, and save metadata under `actor.flags['actor-studio'].aiPortraits`.
4. **Tokenizer (wrap):** Feature-detect `game.modules.get('tokenizer')?.api` and call its `autoToken`/convert API to produce a masked token; if Tokenizer is not installed, allow the portrait to be used as a token without masking and present an install hint.
5. **Enable Ring & Scale:** Update `actor.prototypeToken.ring` to `enabled: true` and set `ring.subject.texture` to the (masked) token image; expose the Fix Scale slider for manual adjustment.
6. **Settings & Tests:** Add a minimal `Enable AI Tokens` setting and add unit tests (`src/tests/test-ai-portrait.spec.js`) mocking FilePicker/OpenRouter/Tokenizer.

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
- Implemented: the Biography panel now reuses the biography prompt and `generateImageFromPrompt` has been updated to use the existing LLM settings (`llmApiKey`, `llmProvider`) via `safeGetSetting` and will prefer OpenRouter when provider is `openrouter`.
- Next: add robust error messages for network/DNS and non‑JSON responses, add unit/integration tests that mock the LLM and OpenRouter endpoints, and add monitoring/logging for the optional `actor-studio-openai` proxy availability.

---

## QA / Checklist 🧪
- [ ] Image generation + preview works
- [ ] Verify `LLM.getBaseUrl()` resolves and returns the expected API (or OpenRouter) when provider is `openrouter` and that the configured `llmApiKey` is valid (test with a small request)
- [ ] Upload to world folder succeeds
- [ ] Actor `img` and `prototypeToken` are updated correctly
- [ ] Tokenizer conversion (if installed) completes and created token looks correct
- [ ] Dynamic ring subject displays and scale is acceptable
- [ ] Permission checks and moderation applied

---

## Pitfalls & Mitigations ⚠️
- Tokenizer API variance → runtime feature-detect + graceful fallback.  
- CORS & provider access → route via server proxy.
- Network / proxy failures → verify `LLM.getBaseUrl()` resolves and returns JSON; show clear UI errors when the base URL or OpenRouter is unreachable (DNS or network issues). Fall back to instructing users to check `llmProvider`/`llmApiKey` and the `actor-studio-openai` proxy status.
- Large images → resize server-side (restrict max pixel size).
- Ring scale mismatch → provide user-adjustable `subject.scale` and a `Fix Scale` helper.

---

> Notes: This plan is intentionally modular: the UI and Tokenizer steps are optional toggles; core functionality works with only a server image generator and Foundry uploads.

---

If you want, I can now add a minimal issue/patch checklist and test stubs to the repo—tell me which step you'd like to implement first. 🔧✨
