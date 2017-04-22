// @flow
const client = require('../client');

// getSnapshot returns a Promise that checks the products current status
// this seems to be set to BTC automatically.
// https://docs.gdax.com/#get-product-ticker
function getSnapshot() {
    return new Promise((resolve, reject) =>
        client.getProductTicker((err, res, data) => {
            if (err) {
                return reject(err);
            } else if (data.message) {
                return reject(data.message);
            } else {
                return resolve(data);
            }
        })
    ).catch(e => console.warn(e));
}

module.exports = {
    getSnapshot,
};
