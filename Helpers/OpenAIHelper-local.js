// Helpers/OpenAIHelper.js
const config = require('../config');
const axios = require('axios');

class OpenAIHelper {
  constructor() {
    this.apiKey = ''
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
      console.log(response.data.choices[0].message.content);
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
      return null;
    }
  }
}

const helper = new OpenAIHelper();
helper.analyzeDocContent('Antônio Barazuol Almon Ccíla De Agnoi, estrangeira, solteira, absolutamente incapaz, customer branding director, portadora do RG n° 348280683 e inscrita no CPF sob o n° 86623733647, Jamey.Fahey7@hotmail.com, residente e domiciliada à Rua Paraíso, n° 2339, Na Rua Dos Taxistas, Teresina - PI, CEP 64000-530, neste ato representada por Benício De Andades Baboa, divorciada, portadora do RG n° 110336793 e inscrita no CPF sob o n° 27667132127, Arielle_Stehr44@hotmail.com, residente e domiciliada à Rua T1, n° 4441, Em Frente A Rotatória, Aracaju - SE, CEP 49001-021.');


module.exports = OpenAIHelper;