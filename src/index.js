const express = require('express');

const messageRouter = require('./routers/messageRouter');
const whatsappClient = require('./services/WhatsappClient');

whatsappClient.initialize();

const app =  express();

const port = 3000;

app.use(express.json());
app.use(messageRouter);

app.listen(port, () => {
    console.log(`Server ready on port ${port}`)
})
