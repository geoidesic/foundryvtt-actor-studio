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
        abilityAnalysis = LLM.analyzeAbilityScoreCorrelations(abilityScores, race, characterDetails);
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

${abilityAnalysis ? `ABILITY SCORE ANALYSIS: ${abilityAnalysis}

Use these ability score insights to inform the biography generation, especially any unusual or notable traits that should be reflected in the character's background, personality, or appearance.` : ''}

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

  static analyzeAbilityScoreCorrelations(abilityScores, race, characterDetails) {
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
    
    // Analyze ability scores
    const str = abilityScores?.str || 0;
    const dex = abilityScores?.dex || 0;
    const con = abilityScores?.con || 0;
    const int = abilityScores?.int || 0;
    const wis = abilityScores?.wis || 0;
    const cha = abilityScores?.cha || 0;
    
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
    return insights.length > 0 ? insights.join('. ') + '.' : '';
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
