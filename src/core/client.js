//@flow

const gdax = require('gdax');
require('dotenv').config();
const { KEY, SECRET, PASS, ENDPOINT } = process.env;

if (!KEY || !SECRET || !PASS || !ENDPOINT) {
    throw new Error('Coinbase client environment variables not properly set.');
}

module.exports = new gdax.AuthenticatedClient(KEY, SECRET, PASS, ENDPOINT);
