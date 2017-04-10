// @flow

// helpers
const moment = require('moment');
const logIt = require('./helpers/logger.js');
const {
    FIFTEEN_MINS_MS,
    THIRTY_MINS_MS,
    ONE_HOUR_MS
} = require('./helpers/constants.js');
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
        title: 'running at',
        info: moment().format('MMMM Do YYYY, h:mm:ss a')
    });

    const marketBTC = await getSnapshot();
    const myBTC = await getAccount('BTC');
    const myUSD = await getAccount('USD');

    // btc -> usd
    if (Number(parseFloat(myBTC.balance)).toFixed(2) > 0) {
        logIt({ title: 'btc balance', info: parseFloat(myBTC.balance) });
        console.log('checking for bitcoin sales options');

        const lastMatch = await getlastMatch(myUSD.id);

        if (lastMatch.amount < 0) {
            const priceAtTimeOfSale = Math.abs(lastMatch.amount) /
                myBTC.balance;
            const diffSinceLastTrade = marketBTC.price - priceAtTimeOfSale;

            if (diffSinceLastTrade < -10) {
                reactivate(ONE_HOUR_MS);
                logIt({
                    form: 'error',
                    title: 'Keep on the look out for potential further investment, Price drop',
                    info: diffSinceLastTrade
                });
            }

            if (diffSinceLastTrade > 25) {
                if (twilioActivated) {
                    notifyUserViaText(
                        `SELL BTC! Significant difference: ${diffSinceLastTrade}.`
                    );
                } else {
                    logIt({
                        title: 'Price difference signficant, buy!',
                        info: diffSinceLastTrade
                    });
                }
                reactivate(FIFTEEN_MINS_MS);
            }

            logIt({
                title: 'Price change not significant',
                info: diffSinceLastTrade
            });
            reactivate(THIRTY_MINS_MS);
        }
    }

    // usd -> btc
    if (parseFloat(myUSD.balance) > 1) {
        logIt({ title: 'USD Balance', info: parseFloat(myUSD.balance) });
        console.log('checking for bitcoin purchasing options');

        const lastMatch = await getlastMatch(myBTC.id);

        if (lastMatch.amount < 0) {
            const btcPurchasePrice = myUSD.balance /
                Math.abs(parseFloat(lastMatch.amount));
            const diffSinceLastTrade = marketBTC.price - btcPurchasePrice;

            if (diffSinceLastTrade > 10) {
                reactivate(ONE_HOUR_MS);
                logIt({
                    form: 'error',
                    title: 'You bought bitcoin early. Has risen',
                    info: diffSinceLastTrade
                });
            }

            if (diffSinceLastTrade < -25) {
                if (twilioActivated) {
                    notifyUserViaText(
                        `Buy BTC! Significant difference: ${diffSinceLastTrade}.`
                    );
                } else {
                    logIt({
                        title: 'Price difference signficant, sell!',
                        info: diffSinceLastTrade
                    });
                }
                reactivate(FIFTEEN_MINS_MS);
            }

            logIt({
                title: 'Price change not significant',
                info: diffSinceLastTrade
            });
            reactivate(THIRTY_MINS_MS);
        }
    }
}

// getLastMatch gets the last movement of bitcoin for the
async function getlastMatch(id) {
    return (await getMatches(id)).filter(
        a => a.details.product_id === 'BTC-USD'
    )[0];
}
