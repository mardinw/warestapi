const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getChatAIResponse } = require('./AIController');
const { listSheets, readSheet } = require('./GoogleServices');

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
        const userMessage = msg.body.toLowerCase();
        const botResponse = await getChatAIResponse(userMessage);

        if (userMessage.includes('list file')) {
            const sheets = await listSheets(process.env.GOOGLE_SPREADSHEET_ID);
            whatsappClient.sendMessage(msg.from, `SpreadSheet files: ${sheets.join(', ')}`);
        } else if (userMessage.includes('tampilkan nilai')) {
            try {
                const result = await getChatAIResponse(userMessage);
                console.log('LLama response:', result);
                const keyword = extractKeyword(userMessage);
                console.log('Extracted keyword:', keyword);

                if (keyword) {
                    const range = `Nilai!A1:Z100`;
                    const data = await readSheet(process.env.GOOGLE_SPREADSHEET_ID, range);
                    console.log('Sheet data:', data);
                    const foundValue = findValueInSheet(data, keyword);

                    whatsappClient.sendMessage(msg.from, foundValue);
                } else {
                    whatsappClient.sendMessage(msg.from, `Maaf, saya tidak bisa menemukan nama siswa dari perintah Anda.`);
                }
            } catch (error) {
                whatsappClient.sendMessage(msg.from, `Terjadi kesalahan: ${error.message}`);
            }
        } else {
            msg.reply(botResponse);
        }
        //msg.reply(botResponse);

    } catch (error){
        console.log(error);
    }
})

const extractKeyword = (message) => {
    const keyword = message.split(' ');
    console.log(keyword);
    return keyword;
}

const findValueInSheet = (sheetData, keywords) => {
    if (!sheetData || sheetData.length === 0) {
        return `Data tidak ditemukan atau kosong.`;
    }

    // const results = [];
    // keywords.forEach(keyword => {
    //     const foundRow = sheetData.find(row => row[1].toLowerCase() === keyword);
    //     if (foundRow) {
    //         results.push(`Data untuk ${keyword}: ${foundRow.join(', ')}`);
    //     }
    // });
    // console.log(results);

    console.log(keywords);
    return keywords.map(keyword => {
        const foundRow = sheetData.find(row => row[1].toLowerCase() === keyword);
        if (foundRow) {
            return `Data untuk ${keyword}: ${foundRow.join(', ')}`;
        } else {
            return;
        }
    })
}

module.exports = whatsappClient
