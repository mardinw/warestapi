const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getChatAIResponse } = require('./AIController');
const { listSheets, readSheet } = require('./GoogleServices');

const whatsappClient = new Client({
    authStrategy: new LocalAuth,
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isAppReady = false;
let appStartTime;

whatsappClient.on("qr", (qr) => qrcode.generate(qr, {small: true}));

whatsappClient.on("ready", () => {
    console.log("WA Client is ready!");
    appStartTime = new Date();
    isAppReady = true;
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


whatsappClient.on("message", async (msg) => {
    try {
        if (!isAppReady) {
            console.log('Aplikasi belum siap, pesan tidak akan direspons.');
            return;
        }

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

        await sleep(2000); 
        
        if (userMessage.includes('list file')) {
            const sheets = await listSheets(process.env.GOOGLE_SPREADSHEET_ID);

            const buttons = [
                { body: 'Nilai Ipin'},
                { body: 'Nilai Upin'},
            ];

            const buttonMessage = new Buttons("Tampilkan nilai yang ada disini", buttons, "Tampilkan nilai", "Silahkan pilih");
            
            // whatsappClient.sendMessage(msg.from, `SpreadSheet files: ${sheets.join(', ')}`);
            console.log(buttonMessage);
            await whatsappClient.sendMessage(msg.from, buttonMessage);
        } else if (userMessage.includes('nilai')) {
            try {
                const keyword = extractKeyword(userMessage);

                if (keyword) {
                    const range = `Nilai!A1:Z100`;
                    const data = await readSheet(process.env.GOOGLE_SPREADSHEET_ID, range);
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
    const keyword = message.toLowerCase().split(' ');
    return keyword;
}

const findValueInSheet = (sheetData, keywords) => {
    if (!sheetData || sheetData.length === 0) {
        return `Data tidak ditemukan atau kosong.`;
    }

    const resultSearch = [];
    keywords.forEach(keyword => {
        const searchFound = sheetData.find(row => row[1].toLowerCase() === keyword);
        if (searchFound) {
            resultSearch.push(searchFound);
        }
    });
    console.log('resultSearch:', resultSearch);
    if (resultSearch.length > 0) {
        return resultSearch.map(row => `Nama: ${row[1]}, Nilai: ${row[2]}`).join('\n');
    }
}

module.exports = whatsappClient
