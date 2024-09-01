require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const whatsappClient = new Client({
    authStrategy: new LocalAuth,
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

whatsappClient.on("qr", (qr) => qrcode.generate(qr, {small: true}));

whatsappClient.on("ready", () => console.log("client is ready!"));

const AIKey = process.env.OPENROUTER_API_KEY;

const AIApiUrl = process.env.AIAPIUrl;

async function getChatAIResponse(message) {
    try {
        const response = await axios.post(AIApiUrl, {
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
                { role: 'user', content: message }
            ],
            max_tokens: 200,
        }, {
            headers: {
                'Authorization': `Bearer ${AIKey}`,
                'Content-Type': 'application/json'
            }
        });

        const botResponse = response.data.choices[0].message.content;
        return botResponse;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return 'Maaf, terjadi kesalahan saat memproses permintaan AI.';
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


whatsappClient.on("message", async (msg) => {
    try {
        const isGroup = msg.from.includes('@g.us');

        await sleep(3000); 

        if (isGroup) {
            console.log('Pesan diterima dari group, bot tidak akan merespons.');
            return;
        }
        if (msg.from != "status@broadcast") {
            const contact = await msg.getContact();
            console.log(contact, msg.body)
        }

        // if (msg.body.toLowerCase().includes('hi') ) {
        //     msg.reply('Hello! Ada yang bisa dibantu?');
        // }
        const userMessage = msg.body;
        const botResponse = await getChatAIResponse(userMessage);

        msg.reply(botResponse);

    } catch (error){
        console.log(error);
    }
})

module.exports = whatsappClient
