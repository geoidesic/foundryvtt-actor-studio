import { MODULE_ID } from '~/src/helpers/constants';
  import { localize as t} from "~/src/helpers/Utility";

export function registerAIImageSettings() {

  game.settings.register(MODULE_ID, 'openrouterApiKey', {
    name: 'OpenRouter API Key',
    hint: 'API key used for OpenRouter/Stability image generation (Phase‑1). Keep this private.',
    scope: 'world',
    config: true,
    type: String,
    default: ''
  });

  game.settings.register(MODULE_ID, 'openrouterModel', {
    name: 'OpenRouter Model (LLM)',
    hint: 'Model to use for text LLM requests (e.g., stability/SDXL).',
    scope: 'world',
    config: true,
    type: String,
    default: 'stability/SDXL'
  });

  game.settings.register(MODULE_ID, 'openrouterImageModel', {
    name: 'OpenRouter Image Model',
    hint: 'Model to use for image generation via OpenRouter (e.g., openai/gpt-5-image or bytedance-seed/seedream-4.5).',
    scope: 'world',
    config: true,
    type: String,
    default: 'bytedance-seed/seedream-4.5'
  });

  game.settings.register(MODULE_ID, 'enableAiTokens', {
    name: t('Setting.EnablePortraitGeneration.Name'),
    hint: t('Setting.EnablePortraitGeneration.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE_ID, 'quenchAutorun', {
    name: 'Quench autorun',
    hint: 'If enabled for this world, Quench will automatically run registered batches and write Data/quench-report.json on startup. Intended for CI/local automation.',
    scope: 'world',
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, 'enableTokenCreation', {
    name: t('Setting.EnableTokenCreation.Name'),
    hint: t('Setting.EnableTokenCreation.Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, 'aiImagesUsePlaceholderOnFailure', {
    name: 'Use placeholder image on failure',
    hint: 'When image generation fails, use a built-in placeholder image so the UI remains usable (MVP convenience toggle).',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });
}
