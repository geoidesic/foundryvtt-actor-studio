import "./dist/index.js";

// Temporary diagnostic - remove after testing
Hooks.once('ready', async () => {
  console.log('=== OpenRouter Image Generation Diagnostic ===\n');
  
  const MODULE_ID = 'foundryvtt-actor-studio';
  let apiKey, provider, imageModel;
  
  try {
    const openrouterKey = game.settings.get(MODULE_ID, 'openrouterApiKey');
    const llmKey = game.settings.get(MODULE_ID, 'llmApiKey');
    apiKey = openrouterKey || llmKey;
    provider = game.settings.get(MODULE_ID, 'llmProvider') || 'openai';
    imageModel = game.settings.get(MODULE_ID, 'openrouterImageModel') || 'bytedance-seed/seedream-4.5';
    
    console.log('📋 Settings:', { provider, apiKey: apiKey ? `***${apiKey.slice(-4)}` : '❌ MISSING', imageModel });
  } catch (err) {
    console.error('❌ Failed to read settings:', err);
    return;
  }
  
  if (!apiKey) {
    console.error('❌ No API key configured.');
    return;
  }
  
  console.log('🔍 Testing OpenRouter models endpoint...');
  const baseUrl = 'https://openrouter.ai/api/v1';
  
  try {
    const modelsRes = await fetch(`${baseUrl}/models`, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    console.log(`  Models: ${modelsRes.status} ${modelsRes.statusText}`);
    
    if (modelsRes.ok) {
      const data = await modelsRes.json();
      const imageModels = (data.data || []).filter(m => m.pricing?.image).slice(0, 5);
      console.log(`  ✅ ${imageModels.length} image models:`, imageModels.map(m => m.id));
    }
  } catch (err) {
    console.error('  ❌ Models failed:', err.message);
  }
  
  console.log('\n🎨 Testing image generation...');
  const attempts = [];
  const modelCandidates = [imageModel, 'openai/gpt-5-image-mini', 'bytedance-seed/seedream-4.5'];
  const endpoints = ['chat/completions', 'generation', 'images/generations'];
  
  for (const model of modelCandidates) {
    for (const endpoint of endpoints) {
      const url = `${baseUrl}/${endpoint}`;
      const payloads = [
        { model, messages: [{ role: 'user', content: 'Fantasy portrait' }], response_format: { type: 'image' }, size: '512x512' },
        { model, prompt: 'Fantasy portrait', size: '512x512' },
        { model, input: { prompt: 'Fantasy portrait', size: '512x512' } }
      ];
      
      for (const payload of payloads) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          const text = await res.text();
          const data = (() => { try { return JSON.parse(text); } catch { return {}; } })();
          
          attempts.push({ model, endpoint, status: res.status, ok: res.ok });
          
          if (res.ok) {
            console.log(`  ✅ SUCCESS: ${model} @ ${endpoint}`);
            console.log('     Response:', data);
            console.log('\n🎉 Working config:', { model, endpoint: url, payload });
            return;
          } else {
            console.log(`  ❌ ${model} @ ${endpoint}: ${res.status} - ${data.error?.message || ''}`);
          }
        } catch (err) {
          console.log(`  ❌ ${model} @ ${endpoint}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }
  
  console.log('\n❌ All attempts failed');
  console.table(attempts);
});