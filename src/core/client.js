const gdax = require('gdax');
require('dotenv').config();
const { KEY, SECRET, PASS, ENDPOINT } = process.env;

module.exports = {
    authClient: new gdax.AuthenticatedClient(KEY, SECRET, PASS, ENDPOINT),
    pubClient: coinCurreny => new gdax.PublicClient(coinCurreny),
};
