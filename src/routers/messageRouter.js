const express = require('express')

const router = new express.Router()

const whatsappClient = require('../services/WhatsappClient');


router.get('/', (req, res) => {
    res.send('Hello world');
})

router.post('/message', (req, res) => {
    whatsappClient.sendMessage(req.body.phoneNumber, req.body.message);
    res.send();
})

module.exports = router;
