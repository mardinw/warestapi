const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getChatAIResponse } = require('./AIController');

const whatsappClient = new Client({
    authStrategy: new LocalAuth,
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

whatsappClient.on("qr", (qr) => qrcode.generate(qr, {small: true}));

whatsappClient.on("ready", () => console.log("client is ready!"));

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
