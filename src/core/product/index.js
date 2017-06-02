// @flow
const { pubClient } = require('../client');

// getProductSnapshot returns a Promise that checks the products current status
// this seems to be set to BTC automatically.
function getProductSnapshot(currency: string): Promise<number | Error> {
    return new Promise((resolve, reject) => {
        let client = pubClient(currency);
        return client.getProductTicker((err, res, data) => {
            if (err) {
                return reject(new Error(err));
            } else if (data.message) {
                return reject(new Error(data.message));
            } else {
                return resolve(parseFloat(data.price));
            }
        });
    });
}

module.exports = {
    getProductSnapshot,
};
