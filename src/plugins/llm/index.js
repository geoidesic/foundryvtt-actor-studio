import { MODULE_ID } from "~/src/helpers/constants";

class LLM {

  apiKey = 'actor-studio-gpt-beta';
  baseUrl = 'https://actor-studio-llm.vercel.app/api';
  // baseUrl = 'http://localhost:3000/api';
  // baseUrl = 'https://heavy-rocks-clean.loca.lt/api';
  // baseUrl = 'https://actor-studio-openai-esld6n48d-geoidesics-projects.vercel.app/api';
  constructor() {
  }

  getBaseUrl() {
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

  getApiKey() {
    try {
      const settingKey = game?.settings?.get ? game.settings.get(MODULE_ID, 'llmApiKey') : this.apiKey;
      console.log('[LLM] getApiKey:', { settingKey: settingKey ? '***' + settingKey.slice(-4) : 'none', fallback: this.apiKey });
      return settingKey || this.apiKey;
    } catch (error) {
      console.warn('LLM: Could not get API key from settings, using default', error);
      return this.apiKey;
    }
  }

  getLicenseKey() {
    try {
      return game?.settings?.get ? game.settings.get(MODULE_ID, 'AardvarkLicenseCode') : '';
    } catch (error) {
      console.warn('LLM: Could not get license key from settings', error);
      return '';
    }
  }

  getProvider() {
    try {
      const provider = game?.settings?.get ? game.settings.get(MODULE_ID, 'llmProvider') : 'openai';
      console.log('[LLM] getProvider:', { provider });
      return provider;
    } catch (error) {
      console.warn('LLM: Could not get provider from settings, using default', error);
      return 'openai';
    }
  }

  async generateName(race) {
    const provider = this.getProvider();
    const baseUrl = this.getBaseUrl();
    const apiKey = this.getApiKey();

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
            'Authorization': `Bearer ${this.getApiKey()}`,
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
            'x-api-key': this.getApiKey(),
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
            'Authorization': `Bearer ${this.getApiKey()}`,
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
}

export default new LLM();
