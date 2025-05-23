// Helpers/OpenAIHelper.js
const config = require('../config');
const axios = require('axios');

class OpenAIHelper {
  constructor() {
    this.apiKey = config.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async analyzeDocContent(content) {
    const prompt = `
      Por favor verifique os dados de Outurgante, procure algum erro, inconsitência com o gênero da pessoa. 
      Também verifique o local da assinatura e finalmente o dado dos advogados se estão constando. 
      
      Você pode também informar que a IA é meu leal assistente jurídico que vai corrigir erros.
      
      Conteúdo do documento:
      ${content}
    `;

    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Você é um assistente jurídico leal.' },
          { role: 'user', content: prompt }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error communicating with OpenAI API:', error.message);
      return null;
    }
  }
}

module.exports = OpenAIHelper;