const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth});

const listSheets = async (spreadsheetId) => {
    const response = await sheets.spreadsheets.get({ spreadsheetId});
    return response.data.sheets.map(sheet => sheet.properties.title);
}

const readSheet = async (spreadsheetId, range) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
    });
    return response.data.values;
}

const writeSheet = async (spreadsheetId, range, values) => {
    sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values },
    });
}

module.exports = { listSheets, readSheet, writeSheet}