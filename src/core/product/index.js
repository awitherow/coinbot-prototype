// @flow
const { pubClient } = require('../client');

type Product = {
    'trade_id': number,
    'price': string,
    'size': string,
    'bid': string,
    'ask': string,
    'volume': string,
    'time': string,
};

// getSnapshot returns a Promise that checks the products current status
// this seems to be set to BTC automatically.
function getSnapshot(cc: string): Promise<Product | Error> {
    return new Promise((resolve, reject) => {
        let client = pubClient(cc);
        return client.getProductTicker((err, res, data) => {
            if (err) {
                return reject(new Error(err));
            } else if (data.message) {
                return reject(new Error(data.message));
            } else {
                return resolve(data);
            }
        });
    });
}

module.exports = {
    getSnapshot,
};
