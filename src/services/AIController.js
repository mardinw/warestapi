require('dotenv').config();
const axios = require('axios');

const AIKey = process.env.OPENROUTER_API_KEY;

const AIApiUrl = process.env.AIAPIUrl;

async function getChatAIResponse(userMessage) {
    try {
        const response = await axios.post(AIApiUrl, {
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
                { role: 'user', content: userMessage }
            ],
            max_tokens: 200,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${AIKey}`,
                'Content-Type': 'application/json'
            }
        });

        let botResponse = response.data.choices[0].message.content;

        botResponse = botResponse.replace(/Meta/g, 'Develop AI').replace(/Llama/g, 'Obot');
        return botResponse;
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return 'Maaf, terjadi kesalahan saat memproses permintaan AI.';
    }
}

module.exports = { getChatAIResponse }