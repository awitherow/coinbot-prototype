// @flow
const client = require('../client');

// getSnapshot returns a Promise that checks the products current status
// this seems to be set to BTC automatically.
// https://docs.gdax.com/#get-product-ticker
function getSnapshot() {
    return new Promise((resolve, reject) =>
        client.getProductTicker((err, res, data) => {
            if (err) {
                return reject(new Error(err));
            } else if (data.message) {
                return reject(new Error(data.message));
            } else {
                return resolve(data);
            }
        })
    );
}

module.exports = {
    getSnapshot,
};
