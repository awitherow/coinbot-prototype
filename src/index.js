// @flow

// helpers
const moment = require('moment');
const logIt = require('./helpers/logger.js');

// account related functions
const {
    getAccount,
    getAccountHistory
} = require('./core/account');

// product related functions
const {
    getSnapshot
} = require('./core/product');

function reactivate(time) {
    setInterval(run, time);
    logIt({
        title: 'checking again at',
        info: moment().add(time, 'milliseconds')
    });
}

run();

// also upon completion, it will be run on a setInterval determined on the
// decide() function that will be used later.
async function run() {
    logIt({
        title: 'server started',
        info: moment().format('MMMM Do YYYY, h:mm:ss a')
    });

    const marketBTC = await getSnapshot();
    const myBTC = await getAccount('BTC');
    const myUSD = await getAccount('USD');
    const lastAction = await getAccountHistory(myBTC.id);

    if (parseFloat(myBTC.balance)) {
        logIt({ title: 'btc balance', info: parseFloat(myBTC.balance) });
    }

    if (parseFloat(myUSD.balance)) {
        logIt({
            title: 'usd balance',
            info: parseFloat(myUSD.balance)
        });

        const lastBTCPurchase = lastAction.filter(
            a => a.details.product_id === 'BTC-USD'
        )[0];

        // ensure last trade was bitcoin.
        if (lastBTCPurchase) {
            const btcPurchasePrice = myUSD.balance /
                Math.abs(parseFloat(lastBTCPurchase.amount));
            const diffSinceLastTrade = marketBTC.price - btcPurchasePrice;

            if (diffSinceLastTrade > 25) {
                logIt({
                    form: 'error',
                    title: 'whoops, bought early. has risen',
                    info: diffSinceLastTrade
                });
                // send text
                reactivate(7200000);
            } else if (diffSinceLastTrade < -50) {
                logIt({
                    title: 'time to buy! different is significant',
                    info: diffSinceLastTrade
                });
                // send text
                reactivate(1800000);
            } else {
                logIt({
                    title: 'difference',
                    info: diffSinceLastTrade
                });
                // send text
                reactivate(14400000);
            }
        }
    }
    // TODO:
    // if user has USD (marketBTC < lastSale) run buy analyze, else activate later
    // analyze(sale || buy, action && latest value).then(decide && theory);
}
