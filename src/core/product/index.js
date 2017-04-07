const gdax = require('gdax');
require('dotenv').config();
const { KEY, SECRET, PASS, ENDPOINT } = process.env;
const client = new gdax.AuthenticatedClient(KEY, SECRET, PASS, ENDPOINT);

// getSnapshot returns a Promise that checks the products current status
// this seems to be set to BTC automatically.
// https://docs.gdax.com/#get-product-ticker
function getSnapshot() {
    return new Promise((resolve, reject) =>
        client.getProductTicker((err, res, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        }));
}

module.exports = {
    getSnapshot
};
