const express = require('express')

const router = new express.Router()

const whatsappClient = require('../services/WhatsappClient');
const { listSheets, readSheet } = require('../services/GoogleServices');


router.get('/', async (req, res) => {
    res.send('Hello world');
})

router.post('/message', async (req, res) => {
    whatsappClient.sendMessage(req.body.phoneNumber, req.body.message);
    res.send();
})

router.get('/sheets', async (req, res) => {
    try {
        const sheets = await listSheets(req.query.spreadsheetId)
        res.json(sheets);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

router.get('/sheets/read', async (req, res) => {
    try {
        const data = await readSheet(req.query.spreadsheetId, req.query.range);
        res.json(data);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

module.exports = router;
