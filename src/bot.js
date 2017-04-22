// @flow

// helpers
const moment = require('moment');
const logIt = require('./helpers/logger.js');
const {
    FIVE_MINS_MS,
    FIFTEEN_MINS_MS,
    THIRTY_MINS_MS,
    ONE_HOUR_MS,
} = require('./helpers/constants.js');
const { twilioActivated, notifyUserViaText } = require('./notifier/');
// account related functions
const { getAccount, getLastOrder } = require('./core/account');

// product related functions
const { getSnapshot } = require('./core/product');

function attemptRun() {
    try {
        run();
    } catch (e) {
        logIt({
            form: 'error',
            title: 'failed to run',
            info: e,
        });
        reactivate(FIFTEEN_MINS_MS);
    }
}

function reactivate(time) {
    setInterval(attemptRun, time);
    logIt({
        title: 'checking again',
        info: moment().add(time, 'milliseconds').fromNow(),
    });
}

// also upon completion, it will be run on a setInterval determined on the
// decide() function that will be used later.
async function run() {
    logIt({
        title: 'running at',
        info: moment().format('MMMM Do YYYY, h:mm:ss a'),
    });

    const marketBTC = await getSnapshot();
    const myBTC = await getAccount('BTC');
    const myUSD = await getAccount('USD');

    // btc -> usd
    if (Number(parseFloat(myBTC.balance)).toFixed(2) > 0) {
        console.log('bitcoin -> usd');
        logIt({ title: 'btc balance', info: parseFloat(myBTC.balance) });

        const lastMatch = await getLastOrder(myUSD.id);
        // last match should be a deficit of the last transfer you made
        // aka, btc -> usd trade area should have deficit of usd, as we
        // last purchased btc with usd.
        if (lastMatch < 0) {
            const priceAtTimeOfSale = Math.abs(lastMatch) / myBTC.balance;
            const diffSinceLastTrade = marketBTC.price - priceAtTimeOfSale;

            if (diffSinceLastTrade < -10) {
                logIt({
                    form: 'error',
                    title: 'Keep on the look out for potential further investment, Price drop',
                    info: diffSinceLastTrade,
                });
                reactivate(ONE_HOUR_MS);
            } else if (diffSinceLastTrade > 10) {
                logIt({
                    form: 'notice',
                    title: 'BTC price rising, increasing attempt frequency',
                    info: diffSinceLastTrade,
                });
                reactivate(FIFTEEN_MINS_MS);
            } else if (diffSinceLastTrade > 20) {
                if (twilioActivated) {
                    notifyUserViaText(
                        `SELL BTC! Significant difference: ${diffSinceLastTrade}.`
                    );
                } else {
                    logIt({
                        title: 'Price difference signficant, buy!',
                        info: diffSinceLastTrade,
                    });
                }
                reactivate(FIVE_MINS_MS);
            } else {
                logIt({
                    title: 'Price change not significant',
                    info: diffSinceLastTrade,
                });
                reactivate(THIRTY_MINS_MS);
            }
        }
    }

    // usd -> btc
    if (parseFloat(myUSD.balance) > 1) {
        console.log('usd -> bitcoin');
        logIt({ title: 'USD Balance', info: parseFloat(myUSD.balance) });

        const lastMatch = await getLastOrder(myBTC.id);

        if (lastMatch < 0) {
            const btcPurchasePrice =
                myUSD.balance / Math.abs(parseFloat(lastMatch));
            const diffSinceLastTrade = marketBTC.price - btcPurchasePrice;

            if (diffSinceLastTrade > 10) {
                logIt({
                    form: 'error',
                    title: 'You bought bitcoin early. Has risen',
                    info: diffSinceLastTrade,
                });
                reactivate(ONE_HOUR_MS);
            } else if (diffSinceLastTrade < -10) {
                logIt({
                    form: 'notice',
                    title: 'BTC is falling, increasing attempt frequency',
                    info: diffSinceLastTrade,
                });
                reactivate(FIFTEEN_MINS_MS);
            } else if (diffSinceLastTrade < -20) {
                if (twilioActivated) {
                    notifyUserViaText(
                        `Buy BTC! Significant difference: ${diffSinceLastTrade}.`
                    );
                } else {
                    logIt({
                        title: 'Price difference signficant, sell!',
                        info: diffSinceLastTrade,
                    });
                }
                reactivate(FIVE_MINS_MS);
            } else {
                logIt({
                    title: 'Price change not significant',
                    info: diffSinceLastTrade,
                });
                reactivate(THIRTY_MINS_MS);
            }
        }
    }
}

module.exports = {
    attemptRun,
};
