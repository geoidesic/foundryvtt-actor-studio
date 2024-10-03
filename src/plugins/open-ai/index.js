import { MODULE_ID } from "~/src/helpers/constants";

class OpenAI {

  apiKey = 'actor-studio-gpt-beta' || game.settings.get(MODULE_ID, 'openaiApiKey');
  baseUrl = 'https://actor-studio-openai.vercel.app/api';
  // baseUrl = 'http://localhost:3000/api';
  // baseUrl = 'https://heavy-rocks-clean.loca.lt/api';
  // baseUrl = 'https://actor-studio-openai-esld6n48d-geoidesics-projects.vercel.app/api';
  constructor() {
  }

  async generateName(race) {
    const response = await fetch(`${this.baseUrl}/generateName`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(
        { 
          licenseKey: game.settings.get(MODULE_ID, 'aardvark-license-code'),
          prompt: `Generate a fantasy RPG name for an ${race}`,
        }
      )
    });
    
    const data = await response.json();
    
    game.system.log.d("Generated name", data);

    return data.object.name;
  }
}

export default new OpenAI();