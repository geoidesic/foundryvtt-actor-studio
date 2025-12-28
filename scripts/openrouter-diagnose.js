/**
 * OpenRouter Image Generation Diagnostic Script
 * 
 * Run this in the Foundry browser console (F12) to test OpenRouter image generation.
 * This script reads your configured API key from module settings and attempts
 * various OpenRouter endpoints to find one that works.
 * 
 * Usage:
 *   1. Open Foundry VTT in your browser
 *   2. Press F12 to open Developer Console
 *   3. Copy and paste this entire file into the console
 *   4. Press Enter
 * 
 * The script will:
 *   - Read your llmApiKey/openrouterApiKey from settings
 *   - Try to fetch the models list from OpenRouter
 *   - Attempt image generation with multiple endpoint/model combinations
 *   - Log detailed diagnostics for each attempt
 */

(async function openRouterDiagnostic() {
  console.log('=== OpenRouter Image Generation Diagnostic ===\n');
  
  // Step 1: Read settings
  const MODULE_ID = 'foundryvtt-actor-studio';
  let apiKey, provider, imageModel, baseModel;
  
  try {
    const openrouterKey = game.settings.get(MODULE_ID, 'openrouterApiKey');
    const llmKey = game.settings.get(MODULE_ID, 'llmApiKey');
    apiKey = openrouterKey || llmKey;
    provider = game.settings.get(MODULE_ID, 'llmProvider') || 'openai';
    imageModel = game.settings.get(MODULE_ID, 'openrouterImageModel') || 'bytedance-seed/seedream-4.5';
    baseModel = game.settings.get(MODULE_ID, 'openrouterModel') || 'stability/SDXL';
    
    console.log('📋 Settings loaded:');
    console.log('  Provider:', provider);
    console.log('  API Key:', apiKey ? `***${apiKey.slice(-4)} (${apiKey.length} chars)` : '❌ MISSING');
    console.log('  Image Model:', imageModel);
    console.log('  Base Model:', baseModel);
    console.log('');
  } catch (err) {
    console.error('❌ Failed to read settings:', err);
    return;
  }
  
  if (!apiKey) {
    console.error('❌ No API key configured. Set llmApiKey or openrouterApiKey in module settings.');
    return;
  }
  
  // Step 2: Test models endpoint
  console.log('🔍 Step 1: Fetching available models from OpenRouter...');
  const baseUrl = 'https://openrouter.ai/api/v1';
  let availableModels = [];
  
  try {
    const modelsRes = await fetch(`${baseUrl}/models`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    console.log('  Status:', modelsRes.status, modelsRes.statusText);
    
    if (modelsRes.ok) {
      const modelsData = await modelsRes.json();
      availableModels = modelsData.data || [];
      
      // Find image-capable models
      const imageCapable = availableModels.filter(m => {
        const id = m.id || '';
        const desc = (m.description || '').toLowerCase();
        const pricing = m.pricing || {};
        return pricing.image || /image|vision|photo|img|flux|stable|diffusion|dall-e|midjourney|sd|seedream/i.test(id + ' ' + desc);
      });
      
      console.log(`  ✅ Found ${availableModels.length} total models`);
      console.log(`  🖼️  Found ${imageCapable.length} image-capable models:`);
      imageCapable.slice(0, 10).forEach(m => {
        console.log(`     - ${m.id}${m.pricing?.image ? ` (image: $${m.pricing.image})` : ''}`);
      });
      console.log('');
    } else {
      const text = await modelsRes.text();
      console.warn('  ⚠️  Models endpoint returned non-OK status:', text.slice(0, 200));
      console.log('');
    }
  } catch (err) {
    console.error('  ❌ Models fetch failed:', err.message);
    console.log('');
  }
  
  // Step 3: Try image generation with multiple approaches
  console.log('🎨 Step 2: Testing image generation endpoints...');
  console.log('');
  
  const prompt = 'Fantasy character portrait, headshot, detailed, realistic';
  const modelCandidates = [
    imageModel,
    'openai/gpt-5-image-mini',
    'openai/gpt-5-image',
    'bytedance-seed/seedream-4.5',
    ...availableModels.filter(m => m.pricing?.image).map(m => m.id).slice(0, 3)
  ];
  
  const uniqueModels = [...new Set(modelCandidates.filter(Boolean))];
  
  // Try different endpoint paths
  const endpoints = [
    'chat/completions',
    'generation',
    'generations',
    'images/generations',
  ];
  
  const attempts = [];
  
  for (const model of uniqueModels) {
    for (const endpoint of endpoints) {
      const url = `${baseUrl}/${endpoint}`;
      
      // Try different payload shapes
      const payloads = [];
      
      // Chat completions format (for models like gpt-5-image)
      if (endpoint === 'chat/completions') {
        payloads.push({
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'image' },
          size: '512x512'
        });
      }
      
      // Direct generation format
      payloads.push({
        model,
        prompt,
        size: '512x512',
        n: 1
      });
      
      // Input wrapper format
      payloads.push({
        model,
        input: { prompt, size: '512x512', n: 1 }
      });
      
      for (let i = 0; i < payloads.length; i++) {
        const payload = payloads[i];
        const attemptLabel = `${model} @ ${endpoint} [payload ${i + 1}]`;
        
        try {
          console.log(`  🔄 Trying: ${attemptLabel}`);
          
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          
          const text = await res.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = { _raw: text.slice(0, 200) };
          }
          
          const result = {
            attempt: attemptLabel,
            url,
            status: res.status,
            statusText: res.statusText,
            ok: res.ok,
            data
          };
          
          attempts.push(result);
          
          if (res.ok) {
            console.log(`     ✅ SUCCESS! Status ${res.status}`);
            console.log('     Response:', data);
            
            // Try to extract image data
            const imageData = data.data?.[0] || data.output?.[0] || data.choices?.[0]?.message?.content;
            if (imageData) {
              console.log('     🖼️  Image data found!');
              if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
                console.log(`     📊 Data URL length: ${imageData.length} chars`);
              } else if (imageData.b64 || imageData.url) {
                console.log('     📊 Image reference found');
              }
            }
            
            console.log('\n✅ WORKING CONFIGURATION FOUND!');
            console.log('   Use this in your code:');
            console.log(`   Model: ${model}`);
            console.log(`   Endpoint: ${url}`);
            console.log(`   Payload shape: ${JSON.stringify(payload, null, 2).slice(0, 200)}...`);
            
            return result;
          } else {
            console.log(`     ❌ Failed: ${res.status} ${res.statusText}`);
            if (data.error) {
              console.log(`     Error: ${data.error.message || JSON.stringify(data.error).slice(0, 100)}`);
            }
          }
        } catch (err) {
          console.log(`     ❌ Exception: ${err.message}`);
          attempts.push({
            attempt: attemptLabel,
            url,
            error: err.message
          });
        }
        
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  console.log('\n❌ All attempts failed. Summary of attempts:');
  console.log('');
  console.table(attempts.map(a => ({
    Model: a.attempt?.split(' @ ')[0] || 'unknown',
    Endpoint: a.url?.split('/').slice(-1)[0] || 'unknown',
    Status: a.status || (a.error ? 'ERROR' : 'N/A'),
    Message: a.data?.error?.message || a.error || a.statusText || ''
  })));
  
  console.log('\n💡 Suggestions:');
  console.log('   1. Check that your OpenRouter API key is valid');
  console.log('   2. Verify your OpenRouter account has image generation enabled');
  console.log('   3. Try a different image model in module settings');
  console.log('   4. Check OpenRouter documentation: https://openrouter.ai/docs');
  
  return { attempts };
})();
