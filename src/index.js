// @flow

// helpers
const moment = require('moment');
const logIt = require('./helpers/logger.js');
const {
    twilioActivated,
    notifyUserViaText
} = require('./notifier/');

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
        title: 'starting run task at',
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
            let reactivationTime = 1800000;

            if (diffSinceLastTrade < -10) {
                reactivationTime = 3600000;
            } else if (diffSinceLastTrade > 50) {
                if (twilioActivated) {
                    const notification = 'time to buy! difference of' +
                        diffSinceLastTrade +
                        'is significant';
                    notifyUserViaText(notification);
                }
                reactivationTime = 900000;
            }
            reactivate(reactivationTime);
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
            let reactivationTime = 1800000;

            if (diffSinceLastTrade > 10) {
                reactivationTime = 3600000;
            } else if (diffSinceLastTrade < -50) {
                if (twilioActivated) {
                    const notification = 'time to sell! difference of' +
                        diffSinceLastTrade +
                        'is significant';
                    notifyUserViaText(notification);
                }
                reactivationTime = 900000;
            }
            reactivate(reactivationTime);
        }
    }
    // TODO:
    // if user has USD (marketBTC < lastMatch) run buy analyze, else activate later
    // analyze(sale || buy, action && latest value).then(decide && theory);
}
