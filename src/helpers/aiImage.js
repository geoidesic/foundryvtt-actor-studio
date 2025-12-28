// Minimal helper to call OpenRouter via fetch using configured module settings
// TODO: replace fetch with a small SDK or server proxy when Phase 2 starts

import { MODULE_ID } from '~/src/helpers/constants';
import { safeGetSetting } from '~/src/helpers/Utility';
import LLM from '~/src/plugins/llm';

export async function generateImageFromPrompt(prompt, options = {}) {
  const { preferAlpha = false } = options;

  // Use existing LLM settings via safeGetSetting
  // Prefer a dedicated OpenRouter API key if configured, otherwise fall back to llmApiKey
  const openrouterKey = safeGetSetting(MODULE_ID, 'openrouterApiKey', '');
  const apiKey = openrouterKey || safeGetSetting(MODULE_ID, 'llmApiKey', '') || LLM.getApiKey();
  const provider = safeGetSetting(MODULE_ID, 'llmProvider', 'openai');
  const model = safeGetSetting(MODULE_ID, 'openrouterModel', 'stability/SDXL');

  if (!apiKey) throw new Error('LLM API key not configured (llmApiKey). Set it in Configure Settings → Actor Studio.');

  // Determine which endpoint to call. Prefer the LLM proxy/baseUrl when possible (keeps behavior consistent with biography generation).
  const baseUrl = LLM.getBaseUrl();
  const imageModel = safeGetSetting(MODULE_ID, 'openrouterImageModel', 'google/gemini-2.5-flash-image-preview');

  // OpenRouter routes image generation through /chat/completions with modalities parameter
  let endpoint = `${baseUrl}/chat/completions`;
  let body;

  if (provider === 'openrouter') {
    // OpenRouter-specific: use chat/completions with modalities
    body = {
      model: imageModel,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['text', 'image'],
      max_tokens: 4096  // Limit to avoid credit issues
    };
  } else {
    // For non-openrouter providers use standard images endpoint
    endpoint = 'https://api.openai.com/v1/images/generations';
    body = { 
      model, 
      prompt, 
      size: '1024x1024', 
      n: 1
    };
  }

  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    // Network/DNS issues are common in misconfigured environments; include endpoint/provider in the error
    const netErr = new Error(`Image generation network error calling ${endpoint} (${provider}): ${err.message}`);
    netErr.endpoint = endpoint;
    netErr.provider = provider;
    netErr.cause = err;
    throw netErr;
  }

  // Handle non-JSON responses and non-OK status with clearer diagnostics
  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch (err) {
    // If we got a 405 or other non-JSON, attempt a small set of alternative endpoints automatically before failing
    const alternatives = [
      `${baseUrl}/images/generate`,
      `${baseUrl}/generation`,
      `${baseUrl}/generations`
    ];

    const attempts = [{ endpoint, status: res.status, statusText: res.statusText, responseText: text }];

    for (const alt of alternatives) {
      try {
        const r = await fetch(alt, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        const t = await r.text();
        let p;
        try { p = JSON.parse(t); } catch (e) { attempts.push({ endpoint: alt, status: r.status, statusText: r.statusText, responseText: t }); continue; }
        if (r.ok && p) {
          // Successful alt endpoint — replace payload and continue
          payload = p;
          res = r;
          break;
        } else {
          attempts.push({ endpoint: alt, status: r.status, statusText: r.statusText, responseText: t });
        }
      } catch (e) {
        attempts.push({ endpoint: alt, error: e.message });
      }
    }

    if (!payload) {
      // If OpenRouter returned 404/Not Found, try model discovery and one automatic retry with a known image model
      if (provider === 'openrouter') {
        try {
          const modelsRes = await fetch(`${baseUrl}/models`, { headers: { 'Authorization': `Bearer ${apiKey}` } });
          const modelsText = await modelsRes.text();
          let modelsJson;
          try { modelsJson = JSON.parse(modelsText); } catch (e) { modelsJson = null; }
          const candidates = [];
          if (modelsJson && Array.isArray(modelsJson?.models)) {
            for (const m of modelsJson.models) {
              const id = m.id || m.name || m.model || null;
              const desc = m.description || '';
              // Heuristic: pick known image model patterns or vendor keywords
              if (id && (/seedream|flux|riverflow|gpt-5-image|image|img|bytedance|openai|sourceful|black-forest/i.test(id + ' ' + desc))) {
                candidates.push(id);
              }
            }
          }

          // Fallback common defaults
          if (candidates.length === 0) candidates.push('bytedance-seed/seedream-4.5', 'openai/gpt-5-image');

          attempts.push({ endpoint: `${baseUrl}/models`, status: modelsRes.status, responseText: modelsText });

          for (const cand of candidates) {
            // Try a single direct re-try with the candidate model
            try {
              const testPayload = { model: cand, input: { prompt, size: '1024x1024', background: preferAlpha ? 'transparent' : 'white', n: 1 } };
              const r = await fetch(`${baseUrl}/generation`, { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(testPayload) });
              const t = await r.text();
              let parsed;
              try { parsed = JSON.parse(t); } catch (e) { attempts.push({ endpoint: `${baseUrl}/generation (retry)`, model: cand, status: r.status, statusText: r.statusText, responseText: t }); continue; }
              if (r.ok && parsed) {
                payload = parsed;
                res = r;
                endpoint = `${baseUrl}/generation`;
                // update the chosen imageModel so tryExtractImage uses the right fields if necessary
                // note: not persisting to settings automatically
                break;
              } else {
                attempts.push({ endpoint: `${baseUrl}/generation (retry)`, model: cand, status: r.status, statusText: r.statusText, responseText: t });
              }
            } catch (e) {
              attempts.push({ endpoint: `${baseUrl}/generation (retry)`, model: cand, error: e.message });
            }
          }
        } catch (e) {
          attempts.push({ endpoint: `${baseUrl}/models`, error: e.message });
        }
      }

      if (!payload) {
        const parseErr = new Error(`Image generation service returned non-JSON response from ${endpoint}. Tried alternative endpoints: ${alternatives.join(', ')}.`);
        parseErr.endpoint = endpoint;
        parseErr.provider = provider;
        parseErr.status = res.status;
        parseErr.statusText = res.statusText;
        parseErr.responseText = text;
        parseErr.attempts = attempts;
        throw parseErr;
      }
    }
  }

  // If the response was a non-OK status, try alternative endpoints/payload shapes before failing
  if (!res.ok) {
    // Try host permutations (openrouter.ai vs api.openrouter.ai) and multiple endpoint paths
    const hostCandidates = new Set();
    hostCandidates.add(baseUrl);
    try {
      const u = new URL(baseUrl);
      if (u.host.includes('openrouter.ai') && !u.host.startsWith('api.')) {
        hostCandidates.add(baseUrl.replace(u.host, `api.${u.host}`));
      } else if (u.host.includes('openrouter.ai') && u.host.startsWith('api.')) {
        hostCandidates.add(baseUrl.replace(u.host, u.host.replace(/^api\./, '')));
      }
    } catch (e) {
      // ignore
    }

    const endpointPaths = ['generation', 'generations', 'generate', 'images/generations', 'images/generate', 'images/generation'];
    const alternatives = [];
    for (const h of hostCandidates) for (const pth of endpointPaths) alternatives.push(`${h}/${pth}`);

    const attempts = [{ endpoint, status: res.status, statusText: res.statusText, responseText: text }];

    for (const alt of alternatives) {
      // try two payload shapes: 'input' and flat {model,prompt}
      const payloads = [
        { model: imageModel, input: { prompt, size: '1024x1024', background: preferAlpha ? 'transparent' : 'white', n: 1 } },
        { model: imageModel, prompt, size: '1024x1024', background: preferAlpha ? 'transparent' : 'white' }
      ];

      for (const p of payloads) {
        try {
          const r = await fetch(alt, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(p)
          });
          const t = await r.text();
          let parsed;
          try { parsed = JSON.parse(t); } catch (e) { attempts.push({ endpoint: alt, status: r.status, statusText: r.statusText, responseText: t }); continue; }
          if (r.ok && parsed) {
            payload = parsed;
            res = r;
            endpoint = alt;
            break;
          } else {
            attempts.push({ endpoint: alt, status: r.status, statusText: r.statusText, responseText: t });
          }
        } catch (e) {
          attempts.push({ endpoint: alt, error: e.message });
        }
      }

      if (payload) break;
    }

    // If still no payload and provider is OpenRouter, attempt model discovery + retries
    if (!payload && provider === 'openrouter') {
      try {
        const discovery = await discoverOpenRouterImageModels();
        if (discovery.ok && discovery.models.length) {
          attempts.push({ endpoint: `${baseUrl}/models`, models: discovery.models.slice(0,5) });
          // Try each candidate model once across common endpoints
          const candidateModels = discovery.models;
          const modelEndpoints = [`${baseUrl}/generation`, `${baseUrl}/images/generate`, `${baseUrl}/generations`, `${baseUrl}/images/generations`];

          for (const cand of candidateModels) {
            for (const me of modelEndpoints) {
              // try input shape and flat shape
              const candPayloads = [
                { model: cand, input: { prompt, size: '1024x1024', background: preferAlpha ? 'transparent' : 'white', n: 1 } },
                { model: cand, prompt, size: '1024x1024', background: preferAlpha ? 'transparent' : 'white' }
              ];

              for (const cp of candPayloads) {
                try {
                  const r = await fetch(me, { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cp) });
                  const t = await r.text();
                  let parsed;
                  try { parsed = JSON.parse(t); } catch (e) { attempts.push({ endpoint: me, model: cand, status: r.status, statusText: r.statusText, responseText: t }); continue; }
                  if (r.ok && parsed) {
                    payload = parsed;
                    res = r;
                    endpoint = me;
                    // Leave attempts recorded and break out
                    break;
                  } else {
                    attempts.push({ endpoint: me, model: cand, status: r.status, statusText: r.statusText, responseText: t });
                  }
                } catch (e) {
                  attempts.push({ endpoint: me, model: cand, error: e.message });
                }
              }

              if (payload) break;
            }
            if (payload) break;
          }
        } else {
          attempts.push({ endpoint: `${baseUrl}/models`, ok: false, message: discovery.message });
        }
      } catch (e) {
        attempts.push({ endpoint: `${baseUrl}/models`, error: e.message });
      }
    }

    if (!payload) {
      const serviceErr = new Error(`Image generation failed (${res.status} ${res.statusText}) from ${endpoint}: ${payload?.error?.message || JSON.stringify(payload).slice(0,200)}`);
      serviceErr.endpoint = endpoint;
      serviceErr.provider = provider;
      serviceErr.status = res.status;
      serviceErr.statusText = res.statusText;
      serviceErr.responseText = text;
      serviceErr.attempts = attempts;
      throw serviceErr;
    }
  }

  // If success, attempt to extract base64 image data or image URL from various provider shapes
  const tryExtractImage = async (payloadObj) => {
    // OpenRouter /chat/completions response: choices[0].message.content contains base64 image
    if (provider === 'openrouter' && payloadObj?.choices?.[0]?.message?.content) {
      const content = payloadObj.choices[0].message.content;
      
      // Content can be string (base64) or array of content parts
      if (typeof content === 'string') {
        // If it starts with data:image, return as-is
        if (content.startsWith('data:image')) return content;
        // Otherwise assume it's raw base64
        return `data:image/png;base64,${content}`;
      }
      
      // Array of content parts: look for image type
      if (Array.isArray(content)) {
        for (const part of content) {
          if (part.type === 'image' || part.type === 'image_url') {
            const imgData = part.image || part.image_url || part.url || part.data;
            if (typeof imgData === 'string') {
              if (imgData.startsWith('data:image')) return imgData;
              return `data:image/png;base64,${imgData}`;
            }
          }
        }
      }
    }

    // Common shapes for other providers
    // payload.output[0].b64 or payload.output[0].data[0].b64
    const out = payloadObj?.output?.[0] || payloadObj?.generations?.[0] || payloadObj?.data?.[0] || payloadObj?.outputs?.[0];
    if (out) {
      // b64 fields
      const b64 = out.b64 || out.b64_json || out.base64 || out.data || out.b64_png || out.b64_image;
      if (b64 && typeof b64 === 'string') return `data:image/png;base64,${b64}`;
      // uri/url
      const url = out.uri || out.url || out.image_url || out.href;
      if (url && typeof url === 'string') {
        // fetch the URL and convert to data URL
        try {
          const r = await fetch(url);
          const blob = await r.blob();
          const arr = await blob.arrayBuffer();
          const b64data = Buffer.from(arr).toString('base64');
          return `data:${blob.type};base64,${b64data}`;
        } catch (e) {
          // ignore and continue
        }
      }
    }

    // Another common shape: payload.data[0].b64_json
    const alt = payloadObj?.data?.[0]?.b64_json || payloadObj?.data?.[0]?.b64 || payloadObj?.data?.[0]?.b64_image;
    if (alt && typeof alt === 'string') return `data:image/png;base64,${alt}`;

    // OpenRouter sometimes returns 'outputs' array with { type: 'image', uri } or nested objects
    if (Array.isArray(payloadObj?.outputs)) {
      for (const o of payloadObj.outputs) {
        if (o.type === 'image' && o.uri) {
          if (o.uri.startsWith('data:')) return o.uri;
          try {
            const r2 = await fetch(o.uri);
            const blob2 = await r2.blob();
            const arr2 = await blob2.arrayBuffer();
            const b64data2 = Buffer.from(arr2).toString('base64');
            return `data:${blob2.type};base64,${b64data2}`;
          } catch (e) {
            // ignore and continue
          }
        }
      }
    }

    return null;
  };

  let dataUrl;
  try {
    dataUrl = await tryExtractImage(payload);
  } catch (e) {
    // Continue to error below
  }

  if (!dataUrl) {
    // Last resort: attempt to find any base64 string in the stringified payload
    const s = JSON.stringify(payload || {});
    const base64Match = s.match(/([A-Za-z0-9+/=]{100,})/);
    if (base64Match) dataUrl = `data:image/png;base64,${base64Match[1]}`;
  }

  if (!dataUrl) {
    const serviceErr = new Error(`Image generation returned an unexpected payload shape from ${endpoint}.`);
    serviceErr.endpoint = endpoint;
    serviceErr.provider = provider;
    serviceErr.status = res.status;
    serviceErr.statusText = res.statusText;
    serviceErr.responseText = JSON.stringify(payload).slice(0, 1024);
    const _attempts = (typeof attempts !== 'undefined') ? attempts : [];
    serviceErr.attempts = _attempts;

    // Fail-open behavior: if the user has enabled the placeholder fallback setting, return a generic data URL
    // to keep the UI responsive for MVP usage. This preserves diagnostics on the returned object.
    try {
      // Read setting safely and default to true for MVP convenience
      const usePlaceholder = safeGetSetting(MODULE_ID, 'aiImagesUsePlaceholderOnFailure', true);
      if (usePlaceholder) {
        const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAABXW4cKAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAJ4AAAAKAAAAn4AAAJ4AAE4AAAB4AAAAgwQw5gAAACZ0RVh0ZGF0ZTpjcmVhdGUAMjAyNS0xMi0yOFQwODoxMzoxNSswMDowMIXvw2QAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjUtMTItMjhUMDg6MTM6MTUrMDA6MDCwz6kQAAAAAElFTkSuQmCC';
        return { dataUrl: placeholder, providerResponse: payload, prompt, diagnostics: { message: serviceErr.message, endpoint, provider, attempts: _attempts } };
      }
    } catch (e) {
      // If reading setting fails for any reason, fall through and throw the original error
    }

    throw serviceErr;
  }

  // payload parsing will depend on chosen provider; we already constructed `dataUrl` above
  const b64 = dataUrl.startsWith('data:') ? dataUrl.split(',')[1] : null;
  if (!b64) throw new Error('No image returned by provider');

  return { dataUrl, providerResponse: payload, prompt };
}

// Fetch available OpenRouter models (returns array of model ids)
export async function discoverOpenRouterImageModels() {
  const openrouterKey = safeGetSetting(MODULE_ID, 'openrouterApiKey', '');
  const apiKey = openrouterKey || safeGetSetting(MODULE_ID, 'llmApiKey', '') || LLM.getApiKey();
  const baseUrl = LLM.getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/models`, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    const text = await res.text();
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { return { ok: false, message: 'Non-JSON response from models endpoint', raw: text }; }
    const models = Array.isArray(parsed.models) ? parsed.models.map(m => m.id || m.name || m.model).filter(Boolean) : [];
    return { ok: true, models };
  } catch (err) {
    return { ok: false, message: err.message };
  }

}
