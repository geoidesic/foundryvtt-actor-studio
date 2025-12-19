import { MODULE_ID } from '~/src/helpers/constants';

class LLM {

  apiKey = 'actor-studio-gpt-beta';
  baseUrl = 'https://actor-studio-llm.vercel.app/api';
  // baseUrl = 'http://localhost:3000/api';
  // baseUrl = 'https://heavy-rocks-clean.loca.lt/api';
  // baseUrl = 'https://actor-studio-openai-esld6n48d-geoidesics-projects.vercel.app/api';
  constructor() {
  }

  static getBaseUrl() {
    const provider = this.getProvider();
    switch (provider) {
      case 'openrouter':
        return 'https://openrouter.ai/api/v1';
      case 'claude':
        return 'https://api.anthropic.com/v1';
      default:
        return this.baseUrl; // Default actor-studio service
    }
  }

  static getApiKey() {
    try {
      const settingKey = game?.settings?.get ? game.settings.get(MODULE_ID, 'llmApiKey') : this.apiKey;
      console.log('[LLM] getApiKey:', { settingKey: settingKey ? '***' + settingKey.slice(-4) : 'none', fallback: this.apiKey });
      return settingKey || this.apiKey;
    } catch (error) {
      console.warn('LLM: Could not get API key from settings, using default', error);
      return this.apiKey;
    }
  }

  static getLicenseKey() {
    try {
      return game?.settings?.get ? game.settings.get(MODULE_ID, 'AardvarkLicenseCode') : '';
    } catch (error) {
      console.warn('LLM: Could not get license key from settings', error);
      return '';
    }
  }

  static getProvider() {
    try {
      const provider = game?.settings?.get ? game.settings.get(MODULE_ID, 'llmProvider') : 'openai';
      console.log('[LLM] getProvider:', { provider });
      return provider;
    } catch (error) {
      console.warn('LLM: Could not get provider from settings, using default', error);
      return 'openai';
    }
  }

  static async generateName(race) {
    const provider = LLM.getProvider();
    const baseUrl = LLM.getBaseUrl();
    const apiKey = LLM.getApiKey();

    console.log('[LLM] Generate name request:', { provider, baseUrl, apiKey: apiKey ? '***' + apiKey.slice(-4) : 'none', race });

    // Check if API key is required for this provider
    if ((provider === 'openrouter' || provider === 'claude') && (!apiKey || apiKey === 'actor-studio-gpt-beta' || apiKey.length < 10)) {
      throw new Error(`API key required for ${provider}. Please set your ${provider === 'claude' ? 'Anthropic' : 'OpenRouter'} API key in Actor Studio settings.`);
    }

    try {
      let response;
      let data;

      if (provider === 'openrouter') {
        // OpenRouter API format
        const model = 'openai/gpt-3.5-turbo';

        response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LLM.getApiKey()}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: `Generate a single fantasy RPG character name for a ${race}. Return only the name, nothing else.`
              }
            ],
            max_tokens: 50,
            temperature: 0.7
          })
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${data.error?.message || 'Unknown error'}`);
        }

        window.GAS.log.d("Generated name via OpenRouter", data);
        return data.choices[0]?.message?.content?.trim() || 'Unknown Name';

      } else if (provider === 'claude') {
        // Direct Claude API format
        response = await fetch(`${baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': LLM.getApiKey(),
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 50,
            messages: [
              {
                role: 'user',
                content: `Generate a single fantasy RPG character name for a ${race}. Return only the name, nothing else.`
              }
            ],
            temperature: 0.7
          })
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(`Claude API error: ${data.error?.message || 'Unknown error'}`);
        }

        window.GAS.log.d("Generated name via Claude Direct", data);
        return data.content[0]?.text?.trim() || 'Unknown Name';

      } else {
        // Default actor-studio service format
        response = await fetch(`${baseUrl}/generateName`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LLM.getApiKey()}`,
          },
          body: JSON.stringify(
            {
              licenseKey: this.getLicenseKey(),
              prompt: `Generate a fantasy RPG name for an ${race}`,
            }
          )
        });

        data = await response.json();

        window.GAS.log.d("Generated name via default service", data);
        return data.object.name;
      }
    } catch (error) {
      console.error('LLM: Failed to generate name', error);
      throw error;
    }
  }

  static async generateBiography({ race, characterClass, level, background, abilityScores, characterDetails, elements }) {
    const provider = LLM.getProvider();
    const baseUrl = LLM.getBaseUrl();
    const apiKey = LLM.getApiKey();

    console.log('[LLM] Generate biography request:', { provider, baseUrl, apiKey: apiKey ? '***' + apiKey.slice(-4) : 'none', race, characterClass, level, elements });

    // Check if API key is required for this provider
    if ((provider === 'openrouter' || provider === 'claude') && (!apiKey || apiKey === 'actor-studio-gpt-beta' || apiKey.length < 10)) {
      throw new Error(`API key required for ${provider}. Please set your ${provider === 'claude' ? 'Anthropic' : 'OpenRouter'} API key in Actor Studio settings.`);
    }

    try {
      // Build the prompt based on selected elements
      const elementPrompts = {
        ideals: 'ideals (core beliefs and principles)',
        flaws: 'flaws (character weaknesses or vices)',
        bonds: 'bonds (connections to people, places, or things)',
        personalityTraits: 'personality traits (distinctive personality characteristics)',
        appearance: 'physical appearance (detailed description of looks)',
        biography: 'background biography (personal history and life story)'
      };

      const selectedPrompts = elements.map(element => elementPrompts[element]).filter(Boolean);
      
      // Build character description with available data
      let characterDescription = `a level ${level} ${characterClass} ${race}`;
      
      if (background) {
        characterDescription += ` with a ${background} background`;
      }
      
      if (abilityScores && Object.keys(abilityScores).length > 0) {
        const abilityList = [];
        const abilityNames = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
        Object.entries(abilityScores).forEach(([key, value]) => {
          if (value && abilityNames[key]) {
            abilityList.push(`${abilityNames[key]} ${value}`);
          }
        });
        if (abilityList.length > 0) {
          characterDescription += ` (Ability Scores: ${abilityList.join(', ')})`;
        }
      }
      
      if (characterDetails && Object.values(characterDetails).some(val => val && val.trim())) {
        const detailList = [];
        Object.entries(characterDetails).forEach(([key, value]) => {
          if (value && value.trim()) {
            detailList.push(`${key}: ${value.trim()}`);
          }
        });
        if (detailList.length > 0) {
          characterDescription += ` (Details: ${detailList.join(', ')})`;
        }
      }
      
      const prompt = `Generate biography elements for ${characterDescription} in a fantasy RPG setting. Provide the following elements in TOON format: ${selectedPrompts.join(', ')}.

Return the response in the following structured format:
TOON
ideals: [content]
flaws: [content]
bonds: [content]
personalityTraits: [content]
appearance: [content]
biography: [content]
ENDTOON

Only include the elements that were requested. Make each element detailed but concise (2-4 sentences). Ensure the content fits a D&D 5e character and is consistent with the provided character details and ability scores.`;

      let response;
      let data;
      let content;

      if (provider === 'openrouter') {
        // OpenRouter API format
        const model = 'openai/gpt-4o-mini';

        response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LLM.getApiKey()}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.8
          })
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${data.error?.message || 'Unknown error'}`);
        }

        window.GAS.log.d("Generated biography via OpenRouter", data);
        content = data.choices[0]?.message?.content?.trim() || '';

      } else if (provider === 'claude') {
        // Direct Claude API format
        response = await fetch(`${baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': LLM.getApiKey(),
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.8
          })
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(`Claude API error: ${data.error?.message || 'Unknown error'}`);
        }

        window.GAS.log.d("Generated biography via Claude Direct", data);
        content = data.content[0]?.text?.trim() || '';

      } else {
        // Default actor-studio service format
        response = await fetch(`${baseUrl}/generateBiography`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LLM.getApiKey()}`,
          },
          body: JSON.stringify({
            licenseKey: LLM.getLicenseKey(),
            race,
            characterClass,
            level,
            background,
            abilityScores,
            characterDetails,
            elements
          })
        });

        data = await response.json();

        window.GAS.log.d("Generated biography via default service", data);
        content = data.object.biography;
      }

      // Parse TOON format response
      return LLM.parseToonBiography(content);

    } catch (error) {
      console.error('LLM: Failed to generate biography', error);
      throw error;
    }
  }

  static parseToonBiography(content) {
    const result = {
      ideals: '',
      flaws: '',
      bonds: '',
      personalityTraits: '',
      appearance: '',
      biography: ''
    };

    // Extract content between TOON and ENDTOON
    const toonMatch = content.match(/TOON\s*\n?(.*?)\s*ENDTOON/s);
    if (!toonMatch) {
      console.warn('LLM: Could not parse TOON format, using raw content');
      return result;
    }

    const toonContent = toonMatch[1];

    // Parse each line
    const lines = toonContent.split('\n');
    let currentKey = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check if this is a key line (ends with colon)
      const keyMatch = trimmed.match(/^(\w+):\s*(.*)$/);
      if (keyMatch) {
        const key = keyMatch[1];
        const value = keyMatch[2];

        // Map keys to our result object
        const keyMap = {
          ideals: 'ideals',
          flaws: 'flaws',
          bonds: 'bonds',
          personalityTraits: 'personalityTraits',
          appearance: 'appearance',
          biography: 'biography'
        };

        if (keyMap[key]) {
          currentKey = keyMap[key];
          result[currentKey] = value;
        }
      } else if (currentKey && trimmed) {
        // Continuation of previous key
        result[currentKey] += ' ' + trimmed;
      }
    }

    return result;
  }

}

export default LLM;
