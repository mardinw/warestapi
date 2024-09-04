require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_KEY)

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 300,
    responseMimeType: "text/plain",
};

async function getChatAIResponse(userMessage) {
    try {
        const chatSession = model.startChat({
            generationConfig,
        });

        const result = await chatSession.sendMessage(userMessage);
        let botResponse = result.response.text();
        return botResponse;
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return 'Maaf, terjadi kesalahan saat memproses permintaan AI.';
    }
}

module.exports = { getChatAIResponse }