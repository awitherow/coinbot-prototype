const gdax = require('gdax');
require('dotenv').config();
const { KEY, SECRET, PASS, ENDPOINT } = process.env;

module.exports = new gdax.AuthenticatedClient(KEY, SECRET, PASS, ENDPOINT);
