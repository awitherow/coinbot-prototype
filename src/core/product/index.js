// @flow
const { pubClient } = require('../client');

// getProductSnapshot returns a Promise that checks the products current status
// this seems to be set to 'BTC-USD' automatically.
// by instantiating a new pubClient with your own currency, you have control.
// https://docs.gdax.com/#get-product-ticker
function getProductSnapshot(coinCurrency: string): Promise<number | Error> {
    return new Promise((resolve, reject) => {
        let client = pubClient(coinCurrency);
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

type Stats = {
    open: number,
    high: number,
    low: number,
    volume: number,
};

// gets the last 24 hour status of a product @param coinCurrency
// coinCurrency can be something like 'BTC-USD', or 'ETH-EUR'
// https://docs.gdax.com/#get-24hr-stats
function get24HourStats(coinCurrency: string): Promise<Stats | Error> {
    return new Promise((resolve, reject) => {
        let client = pubClient(coinCurrency);
        return client.getProduct24HrStats((err, res, data) => {
            if (err) {
                return reject(new Error(err));
            } else if (data.message) {
                return reject(new Error(data.message));
            } else {
                return resolve({
                    open: parseFloat(Number(data.open).toFixed(3)),
                    high: parseFloat(Number(data.high).toFixed(3)),
                    low: parseFloat(Number(data.low).toFixed(3)),
                    volume: parseFloat(Number(data.volume).toFixed(3)),
                });
            }
        });
    });
}

module.exports = {
    getProductSnapshot,
    get24HourStats,
};
