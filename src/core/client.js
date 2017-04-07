const gdax = require('gdax');
require('dotenv').config();
const { KEY, SECRET, PASS, ENDPOINT } = process.env;
const client = new gdax.AuthenticatedClient(KEY, SECRET, PASS, ENDPOINT);

module.exports = client;
