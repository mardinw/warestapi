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
        const isNewsLetter = msg.from.includes('@newsletter');

        if (isGroup || isNewsLetter) {
            console.log('Pesan diterima dari group, bot tidak akan merespons.');
            return;
        }
        if (msg.from != "status@broadcast") {
            const contact = await msg.getContact();
            console.log(contact, msg.body)
        }

        const userMessage = msg.body.toLowerCase();
        const botResponse = await getChatAIResponse(userMessage);

        await sleep(3000); 
        
        if (userMessage.includes('list file')) {
            const sheets = await listSheets(process.env.GOOGLE_SPREADSHEET_ID);
            whatsappClient.sendMessage(msg.from, `SpreadSheet files: ${sheets.join(', ')}`);
        } else if (userMessage.includes('tampilkan nilai')) {
            try {
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
        

    } catch (error){
        console.log(error);
    }
})

const extractKeyword = (message) => {
    const keyword = message.split(' ').pop().toLowerCase();
    console.log(keyword);
    return keyword;
}

const findValueInSheet = (sheetData, keywords) => {
    if (!sheetData || sheetData.length === 0) {
        return `Data tidak ditemukan atau kosong.`;
    }


    const foundRow = sheetData.find(row => row[1].toLowerCase() === keywords);

    if (foundRow) {
        return `Data untuk ${keywords}: ${foundRow.join(', ')}`
    } else {
        return;
    }
}

module.exports = whatsappClient
