// @flow
const { pubClient } = require('../client');

// getSnapshot returns a Promise that checks the products current status
// this seems to be set to BTC automatically.
function getSnapshot(cc: string): Promise<number | Error> {
    return new Promise((resolve, reject) => {
        let client = pubClient(cc);
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
    getSnapshot,
};
