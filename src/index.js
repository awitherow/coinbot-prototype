// @flow

// helpers
const moment = require('moment');
const logIt = require('./helpers/logger.js');
const notifyUserViaText = require('./notifier/');

// account related functions
const {
    getAccount,
    getMatches
} = require('./core/account');

// product related functions
const {
    getSnapshot
} = require('./core/product');

function reactivate(time) {
    setInterval(run, time);
    logIt({
        title: 'checking again',
        info: moment().add(time, 'milliseconds').fromNow()
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

    // ensure that there is BTC to be traded
    if (parseFloat(myBTC.balance)) {
        logIt({ title: 'btc balance', info: parseFloat(myBTC.balance) });

        const lastUSDMovement = await getMatches(myUSD.id);
        const lastUSDMatch = lastUSDMovement.filter(
            a => a.details.product_id === 'BTC-USD'
        )[0];

        if (lastUSDMatch.amount < 0) {
            const priceAtTimeOfSale = Math.abs(lastUSDMatch.amount) /
                myBTC.balance;
            const diffSinceLastTrade = marketBTC.price - priceAtTimeOfSale;

            if (diffSinceLastTrade < -10) {
                const notification = 'whoops, you bought bitcoin a bit early. has dropped further by ' +
                    diffSinceLastTrade +
                    '.';
                notifyUserViaText(notification);
                reactivate(3600000);
            } else if (diffSinceLastTrade > 50) {
                logIt({
                    title: 'time to buy! different is significant',
                    info: diffSinceLastTrade
                });
                const notification = 'time to buy! difference of' +
                    diffSinceLastTrade +
                    'is significant';
                notifyUserViaText(notification);
                reactivate(900000);
            } else {
                logIt({
                    title: 'difference',
                    info: diffSinceLastTrade
                });
                reactivate(1800000);
            }
        }
    }

    // ensure that there is USD to be traded.
    if (parseFloat(myUSD.balance) > 1) {
        logIt({
            title: 'usd balance',
            info: parseFloat(myUSD.balance)
        });

        const lastBTCMovement = await getMatches(myBTC.id);
        const lastBTCMatch = lastBTCMovement.filter(
            a => a.details.product_id === 'BTC-USD'
        )[0];

        if (lastBTCMatch.amount < 0) {
            const btcPurchasePrice = myUSD.balance /
                Math.abs(parseFloat(lastBTCMatch.amount));
            const diffSinceLastTrade = marketBTC.price - btcPurchasePrice;

            if (diffSinceLastTrade > 10) {
                const notification = 'whoops, you sold bitcoin a bit early. has increased further by ' +
                    diffSinceLastTrade +
                    '.';
                notifyUserViaText(notification);
                reactivate(3600000);
            } else if (diffSinceLastTrade < -50) {
                logIt({
                    title: 'time to buy! different is significant',
                    info: diffSinceLastTrade
                })
                const notification = 'time to sell! difference of' +
                    diffSinceLastTrade +
                    'is significant';
                notifyUserViaText(notification);
                reactivate(900000);
            } else {
                logIt({
                    title: 'difference',
                    info: diffSinceLastTrade
                });
                // send text
                reactivate(1800000);
            }
        }
    }
    // TODO:
    // if user has USD (marketBTC < lastMatch) run buy analyze, else activate later
    // analyze(sale || buy, action && latest value).then(decide && theory);
}
