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

  static async generateName(race, context = {}) {
    const provider = LLM.getProvider();
    const baseUrl = LLM.getBaseUrl();
    const apiKey = LLM.getApiKey();

    console.log('[LLM] Generate name request:', { provider, baseUrl, apiKey: apiKey ? '***' + apiKey.slice(-4) : 'none', race, context });

    // Check if API key is required for this provider
    if ((provider === 'openrouter' || provider === 'claude') && (!apiKey || apiKey === 'actor-studio-gpt-beta' || apiKey.length < 10)) {
      throw new Error(`API key required for ${provider}. Please set your ${provider === 'claude' ? 'Anthropic' : 'OpenRouter'} API key in Actor Studio settings.`);
    }

    // Build enhanced prompt with context if available
    let prompt = `Generate a single fantasy RPG character name for a ${race}`;
    
    if (context.characterClass || context.background || context.abilityScores || context.characterDetails) {
      prompt += ' character';
      
      if (context.characterClass) {
        prompt += ` who is a ${context.characterClass}`;
      }
      
      if (context.background) {
        prompt += ` with a ${context.background} background`;
      }
      
      if (context.abilityScores && Object.keys(context.abilityScores).length > 0) {
        const notableScores = [];
        const abilityNames = { str: 'strong', dex: 'agile', con: 'resilient', int: 'intelligent', wis: 'wise', cha: 'charismatic' };
        Object.entries(context.abilityScores).forEach(([key, value]) => {
          if (value >= 15 && abilityNames[key]) {
            notableScores.push(abilityNames[key]);
          }
        });
        if (notableScores.length > 0) {
          prompt += ` who is particularly ${notableScores.join(' and ')}`;
        }
      }
      
      if (context.characterDetails && context.characterDetails.age) {
        const age = parseInt(context.characterDetails.age);
        if (age < 50) prompt += ' and young';
        else if (age > 200) prompt += ' and ancient';
      }
      
      prompt += '.';
    }
    
    prompt += ' Return only the name, nothing else.';

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
                content: prompt
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
                content: prompt
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
              prompt: prompt,
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

  // Legacy method for backward compatibility
  static async generateNameSimple(race) {
    return LLM.generateName(race);
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
        name: 'name (a single fantasy RPG character name)',
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
      
      // Analyze ability scores for correlations and outliers
      let abilityAnalysis = '';
      if (abilityScores && Object.keys(abilityScores).length > 0) {
        abilityAnalysis = LLM.analyzeAbilityScoreCorrelations(abilityScores, race, characterDetails, characterClass, background);
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
      
      // Determine if ability scores are missing or empty
      const abilityScoresMissing = !abilityScores || Object.keys(abilityScores).length === 0 || Object.values(abilityScores).every(v => Number(v) === 0);

      // Build explicit anomaly lines to include in prompt
      // Build integrated instruction to guide the model to weave anomaly explanations into the narrative
      const integratedInstruction = abilityAnalysis && abilityAnalysis.trim() ? LLM.buildIntegratedAnomalyInstruction(abilityAnalysis, characterClass, background) : '';

      // Few-shot example demonstrating the desired integrated style (concise example only)
      const fewShotExample = `EXAMPLE (Desired style):
Input Analysis: Exceptional Strength (18) despite short stature.
Appearance: A compact, muscular figure whose power is obvious despite a small frame; a visible patch of arcane scar tissue on his forearm hints at an early workshop accident.
Biography: Born after a mishap with an experimental forge enchantment, he learned to turn his altered body into an asset, training in the clan workshops where practical skill outshone formal study.`;

      const prompt = `Generate biography elements for ${characterDescription} in a fantasy RPG setting. Provide the following elements in TOON format: ${selectedPrompts.join(', ')}.

${abilityAnalysis ? `ABILITY SCORE ANALYSIS: ${abilityAnalysis}` : ''}

${integratedInstruction}

${fewShotExample}

${abilityScoresMissing ? `NOTE: No explicit ability scores were provided in the request. When necessary, infer plausible ability scores from race, class, and character details and label inferred values clearly (e.g., "Inferred STR ~18"). If you make inferences, integrate them smoothly into the Appearance and Biography text and label inferred scores inline where appropriate (e.g., "(Inferred STR ~18)").` : ''}

Return the response in the following structured format:
TOON
name: [content]
ideals: [content]
flaws: [content]
bonds: [content]
personalityTraits: [content]
appearance: [content]
biography: [content]
ENDTOON

Only include the elements that were requested. Make each element detailed but concise (2-4 sentences). For the name, return only the name without any additional text. Ensure the content fits a D&D 5e character and is consistent with the provided character details and ability scores.`;

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
            abilityAnalysis,
            anomalyInstruction: abilityAnalysis && abilityAnalysis.trim() ? LLM.buildAnomalyInstruction(abilityAnalysis, characterClass, background) : '',
            elements
          })
        });

        data = await response.json();

        window.GAS.log.d("Generated biography via default service", data);
        content = data.object.biography;
      }

      // Parse TOON format response
      let parsed = LLM.parseToonBiography(content);

      // Compliance check: ensure integrated explanations are present in both appearance and biography
      const hasIntegratedExplanation = (text) => {
        if (!text) return false;
        // Look for causal phrases or cause keywords indicating the model explained anomalies inline
        const causalRegex = /\b(because|due to|after|when|as a result|caused by|result of|following|from an|inferred|inferred STR|inferred DEX|enchant|enchantment|magic|augmen|prosthetic|graft|training|accident|mishap|upbringing|clan|workshop|forge)\b/i;
        return causalRegex.test(text);
      };

      const hasAppearanceExplanation = hasIntegratedExplanation(parsed.appearance || '');
      const hasBiographyExplanation = hasIntegratedExplanation(parsed.biography || '');

      // If model didn't integrate explanations as required, attempt a single corrective re-prompt to the LLM
      if (abilityAnalysis && abilityAnalysis.trim() && (!hasAppearanceExplanation || !hasBiographyExplanation)) {
        // Build corrective instruction to integrate explanations into both fields
        const insertPrompt = `You returned the following TOON block but did not integrate the required explanations for the detected anomalies into the Appearance or Biography fields. For EACH requested field (Appearance and Biography), choose a single plausible cause for the anomaly and integrate it naturally into the narrative (do not add labeled 'Anomaly:' lines or bullet lists; weave the cause into 1-2 sentences that explain how the anomaly shaped the character's life). Return only the full TOON block with the integrated explanations included in both fields.

Original output:
${content}
`;

        try {
          // Perform one retry edit request
          let editResponse;
          const provider = LLM.getProvider();
          if (provider === 'openrouter') {
            const model = 'openai/gpt-4o-mini';
            const res = await fetch(`${baseUrl}/chat/completions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LLM.getApiKey()}` },
              body: JSON.stringify({ model, messages: [{ role: 'user', content: insertPrompt }], max_tokens: 800, temperature: 0.8 })
            });
            const d = await res.json();
            editResponse = d.choices?.[0]?.message?.content || '';
          } else if (provider === 'claude') {
            const res = await fetch(`${baseUrl}/messages`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': LLM.getApiKey(), 'anthropic-version': '2023-06-01' },
              body: JSON.stringify({ model: 'claude-3-haiku-20240307', messages: [{ role: 'user', content: insertPrompt }], max_tokens: 800, temperature: 0.8 })
            });
            const d = await res.json();
            editResponse = d.content?.[0]?.text || '';
          } else {
            const res = await fetch(`${baseUrl}/generateBiography`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LLM.getApiKey()}` },
              body: JSON.stringify({ licenseKey: LLM.getLicenseKey(), race, characterClass, level, background, abilityScores, characterDetails, elements, anomalyInstruction: LLM.buildAnomalyInstruction(abilityAnalysis, characterClass, background), editPrompt: insertPrompt })
            });
            const d = await res.json();
            editResponse = d.object?.biography || '';
          }

          if (editResponse && editResponse.trim()) {
            parsed = LLM.parseToonBiography(editResponse);
          }
        } catch (err) {
          window.GAS.log.w('LLM: Anomaly insertion retry failed', err);
        }
      }

      return parsed;

    } catch (error) {
      console.error('LLM: Failed to generate biography', error);
      throw error;
    }
  }

  // Fallback helper: generate short narrative sentences from the ability analysis
  static describeAnomaliesFromAnalysis(analysis, abilityScores = {}, race = '', characterDetails = {}, characterClass = '', background = '') {
    if (!analysis || !analysis.trim()) return '';

    // Simple mapping to produce human-readable explanation sentences
    const reasons = [
      'magical experimentation or a lingering enchantment',
      'unique physiology or a rare birth trait',
      'intensive training or unusual upbringing',
      'a prosthetic, augmentation, or crafted enhancement',
      'an illness or recovery from injury accident'
    ];

    // Compose a concise explanation
    const shortAnalysis = analysis.replace(/\s*\.\s*$/,'');
    const chosen = reasons.slice(0, 3).join(', ').replace(/, ([^,]*)$/, ', or $1');
    const sentence = `Notably, ${shortAnalysis}. Possible explanations include ${chosen}.`;

    // If we have height info and the analysis mentions stature, prefer to include that context
    const height = characterDetails?.height;
    if (height && /stature|height|short|tall/i.test(shortAnalysis)) {
      return `${sentence} This contrast between physical build and abilities has likely shaped their life and reputation.`;
    }

    return sentence;
  }

  static analyzeAbilityScoreCorrelations(abilityScores, race, characterDetails, characterClass = '', background = '') {
    const insights = [];
    
    // Extract physical attributes
    const height = characterDetails?.height;
    const weight = characterDetails?.weight;
    const age = characterDetails?.age;
    
    // Parse height and weight for analysis
    let heightInches = 0;
    let weightLbs = 0;
    
    if (height) {
      // Parse height like "5'10\"" or "3'5\""
      const heightMatch = height.match(/(\d+)'(\d+)"/);
      if (heightMatch) {
        heightInches = parseInt(heightMatch[1]) * 12 + parseInt(heightMatch[2]);
      }
    }
    
    if (weight) {
      // Parse weight, removing "lb" or "lbs" if present
      const weightMatch = weight.match(/(\d+)/);
      if (weightMatch) {
        weightLbs = parseInt(weightMatch[1]);
      }
    }
    
    // Race-based expectations (rough generalizations for D&D 5e)
    const raceExpectations = {
      'dwarf': { 
        expectedHeight: 48, // ~4' average
        expectedWeight: 150,
        typicalStrength: 'high',
        typicalConstitution: 'high',
        size: 'small'
      },
      'elf': { 
        expectedHeight: 66, // ~5'6" average
        expectedWeight: 130,
        typicalDexterity: 'high',
        size: 'medium'
      },
      'halfling': { 
        expectedHeight: 36, // ~3' average
        expectedWeight: 40,
        typicalDexterity: 'high',
        size: 'small'
      },
      'gnome': { 
        expectedHeight: 36, // ~3' average
        expectedWeight: 40,
        typicalIntelligence: 'high',
        size: 'small'
      },
      'human': { 
        expectedHeight: 68, // ~5'8" average
        expectedWeight: 170,
        size: 'medium'
      },
      'half-elf': { 
        expectedHeight: 66,
        expectedWeight: 150,
        typicalCharisma: 'high',
        size: 'medium'
      },
      'half-orc': { 
        expectedHeight: 72,
        expectedWeight: 200,
        typicalStrength: 'high',
        size: 'medium'
      },
      'dragonborn': { 
        expectedHeight: 74,
        expectedWeight: 220,
        typicalStrength: 'high',
        typicalCharisma: 'high',
        size: 'medium'
      },
      'tiefling': { 
        expectedHeight: 68,
        expectedWeight: 160,
        typicalCharisma: 'high',
        typicalIntelligence: 'high',
        size: 'medium'
      }
    };
    
    // Normalize race name for lookup
    const raceKey = race.toLowerCase().replace(/\s+/g, '-');
    const raceData = raceExpectations[raceKey] || raceExpectations[race.split(' ')[0]?.toLowerCase()] || {};
    
    // Normalize ability values (support objects like { value: 18 } or plain numbers)
    const getVal = (v) => {
      if (v == null) return 0;
      if (typeof v === 'number') return v;
      if (typeof v === 'object') return v.value || v.total || 0;
      const parsed = parseInt(v);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const str = getVal(abilityScores?.str);
    const dex = getVal(abilityScores?.dex);
    const con = getVal(abilityScores?.con);
    const int = getVal(abilityScores?.int);
    const wis = getVal(abilityScores?.wis);
    const cha = getVal(abilityScores?.cha);
    
    // Check for exceptional scores (15+ is notable, 18+ is exceptional)
    if (str >= 18) {
      if (raceData.size === 'small' || raceData.typicalStrength !== 'high') {
        insights.push(`Exceptional Strength (${str}) for a ${race} - this character's physical power is remarkable and likely plays a significant role in their background`);
      } else {
        insights.push(`Exceptional Strength (${str}) - this character is unusually powerful even for their race`);
      }
    } else if (str >= 15 && raceData.size === 'small') {
      insights.push(`Notable Strength (${str}) for a small ${race} - this character's physical capability stands out among their diminutive kin`);
    }
    
    if (dex >= 18) {
      insights.push(`Exceptional Dexterity (${dex}) - this character's agility and reflexes are extraordinary`);
    }
    
    if (con >= 18) {
      insights.push(`Exceptional Constitution (${con}) - this character has remarkable physical resilience and endurance`);
    }
    
    if (int >= 18) {
      insights.push(`Exceptional Intelligence (${int}) - this character possesses genius-level intellect`);
    }
    
    if (wis >= 18) {
      insights.push(`Exceptional Wisdom (${wis}) - this character has profound insight and perception`);
    }
    
    if (cha >= 18) {
      insights.push(`Exceptional Charisma (${cha}) - this character has extraordinary personal magnetism and presence`);
    }
    
    // Check for unusual combinations with physical attributes
    if (heightInches > 0 && weightLbs > 0) {
      // Calculate rough BMI-like ratio (weight in lbs / height in inches squared * 703)
      const bmi = (weightLbs / (heightInches * heightInches)) * 703;
      
      if (bmi < 15 && heightInches > 60) { // Very underweight for height
        insights.push(`Unusually light (${weightLbs} lbs) for height (${height}) - this character's slender build is striking and may be due to magical influence, illness, or unique physiology`);
      } else if (bmi > 25 && heightInches < 50) { // Overweight for small stature
        insights.push(`Unusually heavy (${weightLbs} lbs) for small stature (${height}) - this character's build is atypical and noteworthy`);
      }
    }
    
    // Check for strength vs size correlations
    if (str >= 15 && heightInches > 0 && heightInches < 50) { // Strong but very short
      insights.push(`Impressive Strength (${str}) despite small stature (${height}) - this character's physical power defies expectations for their size`);
    }
    
    if (str <= 8 && heightInches > 70) { // Weak but very tall
      insights.push(`Surprisingly low Strength (${str}) for great height (${height}) - this character's physical weakness contrasts with their imposing stature`);
    }
    
    // Age correlations
    if (age) {
      const ageNum = parseInt(age);
      if (ageNum && ageNum < 50 && (wis >= 16 || int >= 16)) {
        insights.push(`Unusually wise/intelligent (${Math.max(wis, int)}) for young age (${age}) - this character's maturity and insight exceed their years`);
      }
      if (ageNum && ageNum > 200 && (str >= 15 || dex >= 15)) {
        insights.push(`Remarkable physical capability (${Math.max(str, dex)}) despite advanced age (${age}) - this character's vitality defies the passage of time`);
      }
    }
    
    // Race-specific insights
    if (race.toLowerCase().includes('gnome') && str >= 15) {
      insights.push(`Unusually strong (${str}) for a gnome - this gnomish character's physical power is exceptional among their typically weaker kin`);
    }
    
    if (race.toLowerCase().includes('halfling') && str >= 15) {
      insights.push(`Notable strength (${str}) for a halfling - this character's physical power stands out among their generally weaker people`);
    }
    
    if (race.toLowerCase().includes('elf') && con <= 10) {
      insights.push(`Lower Constitution (${con}) for an elf - this character's relative physical frailty may be a point of insecurity or adaptation`);
    }
    
    // Return formatted insights
    // Class-based primary ability expectations
    const classPrimary = {
      barbarian: ['str'],
      bard: ['cha'],
      cleric: ['wis'],
      druid: ['wis'],
      fighter: ['str', 'dex'],
      monk: ['dex'],
      paladin: ['str', 'cha'],
      ranger: ['dex'],
      rogue: ['dex'],
      sorcerer: ['cha'],
      warlock: ['cha'],
      wizard: ['int'],
      artificer: ['int'],
      default: []
    };

    const bgPrimary = {
      charlatan: ['cha'],
      soldier: ['str', 'con'],
      sage: ['int'],
      'guild artisan': ['int', 'cha'],
      noble: ['cha', 'int'],
      urchin: ['dex'],
      criminal: ['dex'],
      acolyte: ['wis', 'cha'],
      entertainer: ['cha']
    };

    const normalizeKey = (s) => (s || '').toString().toLowerCase().trim();
    const clsKey = normalizeKey(characterClass).split(' ')[0];
    const bgKey = normalizeKey(background).split(' ')[0];

    const expectedForClass = classPrimary[clsKey] || classPrimary[normalizeKey(characterClass)] || classPrimary.default;
    const expectedForBg = bgPrimary[bgKey] || bgPrimary[normalizeKey(background)] || [];

    // Low primary abilities for class
    expectedForClass.forEach(ab => {
      const val = { str, dex, con, int, wis, cha }[ab];
      if (val !== undefined && val <= 8) {
        insights.push(`Low ${ab.toUpperCase()} (${val}) for a ${characterClass} - this could be a notable flaw or a narrative obstacle for their chosen path`);
      } else if (val !== undefined && val <= 10) {
        insights.push(`Below-average ${ab.toUpperCase()} (${val}) for a ${characterClass} - this may influence their development or backstory`);
      }
    });

    // High abilities that are not primary for class
    const highAbilities = Object.entries({ str, dex, con, int, wis, cha }).filter(([k, v]) => v >= 15).map(([k]) => k);
    highAbilities.forEach(ab => {
      if (!expectedForClass.includes(ab)) {
        const val = { str, dex, con, int, wis, cha }[ab];
        insights.push(`High ${ab.toUpperCase()} (${val}) is not a typical primary for a ${characterClass} - this unusual strength could shape their story or lead to unexpected career choices`);
      }
    });

    // Background mismatch: expected high ability not present
    expectedForBg.forEach(ab => {
      const val = { str, dex, con, int, wis, cha }[ab];
      if (val !== undefined && val <= 9) {
        insights.push(`Low ${ab.toUpperCase()} (${val}) is unusual for someone with a ${background} background and suggests a hidden history or a fall from grace`);
      }
    });

    return insights.length > 0 ? insights.join('. ') + '.' : '';
  }

  static getToneForClass(characterClass = '') {
    const cls = (characterClass || '').toString().toLowerCase();
    const mapping = {
      artificer: 'mechanical and technical',
      wizard: 'scholarly and precise',
      barbarian: 'primal and blunt',
      fighter: 'practical and direct',
      rogue: 'sly and pragmatic',
      bard: 'lyrical and colorful',
      cleric: 'pious and reverent',
      druid: 'earthy and natural',
      paladin: 'honorable and resolute',
      ranger: 'practical and rugged',
      sorcerer: 'intense and emotional',
      warlock: 'mysterious and obsessive',
      monk: 'disciplined and spare',
      default: 'neutral and narrative'
    };
    return mapping[cls] || mapping.default;
  }

  // New instruction builder: ask the model to integrate anomaly explanations into narrative
  static buildIntegratedAnomalyInstruction(abilityAnalysis, characterClass = '', background = '') {
    if (!abilityAnalysis || !abilityAnalysis.trim()) return '';
    const tone = LLM.getToneForClass(characterClass);
    return `INTEGRATE ANOMALIES: The ABILITY SCORE ANALYSIS above lists detected anomalies. For each relevant anomaly, choose a single, plausible cause and *integrate it naturally* into the Appearance and Biography text (1-2 sentences). Do NOT output labeled Anomaly lines, bullet lists, or multiple alternative causes—pick the most coherent single explanation and weave it into the narrative in a ${tone} tone appropriate for a ${characterClass || 'character'}. If age is mentioned, explain how it shapes the character's abilities or reputation. Keep explanations concise and story-driven (avoid enumerating options).`;
  }

  // Backwards-compatible alias for older callers
  static buildAnomalyInstruction(abilityAnalysis, characterClass = '', background = '') {
    return LLM.buildIntegratedAnomalyInstruction(abilityAnalysis, characterClass, background);
  }

  static buildAnomalyLines(abilityAnalysis, abilityScores = {}, race = '', characterDetails = {}, characterClass = '', background = '') {
    if (!abilityAnalysis || !abilityAnalysis.trim()) return [];
    // Split sentences from analysis
    const sentences = abilityAnalysis.split(/[\.\!\?]+/).map(s => s.trim()).filter(Boolean);
    const tone = LLM.getToneForClass(characterClass);

    const getShort = (s) => {
      // Try to extract a short summary from the sentence
      return s.replace(/\s+/g, ' ').trim();
    };

    // Build an explanatory line per sentence, tailored to class tone
    return sentences.map((s) => {
      const summary = getShort(s);
      // Tailor explanation based on keywords — return concise narrative sentences (no 'Anomaly:' prefix)
      let explanation = '';
      if (/strength|strong|powerful/i.test(s) && /short|stature|height/i.test(s)) {
        explanation = `${summary}. Likely causes include intensive heavy-labor training, reinforced musculature, or crafted augmentations that boost raw power despite smaller stature.`;
      } else if (/dexterity|dex/i.test(s) && /low|low(er)?|weak/i.test(s)) {
        explanation = `${summary}. This may be compensated by mechanical stabilizers, crafted braces, or adaptive techniques that reduce the need for fine dexterity in a ${tone} fashion.`;
      } else if (/age|young|youth/i.test(s)) {
        explanation = `${summary}. The character's youth suggests prodigious talent, rapid learning, or accelerated growth after a magical or unusual upbringing.`;
      } else if (/light|heavy|weight/i.test(s) && /unusual|unusually|slender|heavy/i.test(s)) {
        explanation = `${summary}. This unusual build may stem from unique physiology, past injury, magical influence, or specialized diet/training.`;
      } else {
        explanation = `${summary}. Plausible causes include magical experimentation, unique physiology, prosthetic augmentation, or intensive training.`;
      }

      return explanation;
    });
  }

  static parseToonBiography(content) {
    const result = {
      name: '',
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
          name: 'name',
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
