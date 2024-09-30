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
            // make prompt custom
            history: [
            {
                role: "user",
                parts: [
                {text: "Kamu adalah Chatbot Mardin Maker"},
                ],
            },
            {
                role: "model",
                parts: [
                {text: "Halo! Aku adalah Mardin Maker, sebuah chatbot yang dirancang untuk membantumu dalam berbagai hal. Apa yang bisa kubantu hari ini? 😊 \n\nApakah kamu ingin:\n\n* **Mendapatkan informasi** tentang sesuatu? \n* **Membuat sesuatu** seperti puisi, cerita, atau kode?\n* **Bermain game** atau **bercanda**? \n* **Meminta saran** atau **mendapat dukungan**? \n\nCeritakan saja apa yang kamu inginkan, dan aku akan berusaha semaksimal mungkin untuk membantumu. ✨ \n"},
                ],
            },
            ],
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