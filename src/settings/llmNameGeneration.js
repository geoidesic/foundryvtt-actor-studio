import { TJSGameSettings } from '#runtime/svelte/store/fvtt/settings';
import { MODULE_ID } from '../helpers/constants';

class LLMNameGenerationSettings extends TJSGameSettings {
  constructor() {
    super(MODULE_ID);
  }

  init() {
    const namespace = this.namespace;

    this.register({
      namespace,
      key: 'EnableLLMNameGeneration',
      options: {
        name: 'GAS.Setting.EnableLLMNameGeneration.Name',
        hint: 'GAS.Setting.EnableLLMNameGeneration.Hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
      },
    });

    this.register({
      namespace,
      key: 'llmApiKey',
      options: {
        name: 'GAS.Setting.LLMApiKey.Name',
        hint: 'GAS.Setting.LLMApiKey.Hint',
        scope: 'world',
        config: true,
        type: String,
        default: 'actor-studio-gpt-beta',
      },
    });

    this.register({
      namespace,
      key: 'llmProvider',
      options: {
        name: 'GAS.Setting.LLMProvider.Name',
        hint: 'GAS.Setting.LLMProvider.Hint',
        scope: 'world',
        config: true,
        type: String,
        choices: {
          'openai': 'OpenAI',
          'claude': 'Claude',
          'openrouter': 'OpenRouter'
        },
        default: 'openai',
      },
    });
  }
}

export const llmNameGenerationSettings = new LLMNameGenerationSettings();