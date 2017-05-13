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

type Millisecond =
    | FIVE_MINS_MS
    | FIFTEEN_MINS_MS
    | THIRTY_MINS_MS
    | ONE_HOUR_MS;

function reactivate(time: Millisecond) {
    setInterval(attemptRun, time);
    logIt({
        title: 'checking again',
        info: moment().add(time, 'milliseconds').fromNow(),
    });
}

function attemptRun() {
    require('dotenv').config();
    const currency = process.env.CURRENCY;

    try {
        run(currency);
    } catch (e) {
        logIt({
            form: 'error',
            title: 'failed to run',
            info: e,
        });
        reactivate(FIFTEEN_MINS_MS);
    }
}

attemptRun();

// also upon completion, it will be run on a setInterval determined on the
// decide() function that will be used later.
async function run(currency: string) {
    logIt({
        title: 'running at',
        info: moment().format('MMMM Do YYYY, h:mm:ss a'),
    });

    const [marketBTC, myBTC, myCurrency] = await Promise.all([
        getSnapshot(`BTC-${myCurrency}`),
        getAccount('BTC'),
        getAccount(currency),
    ]);

    // btc -> currency
    if (Number(parseFloat(myBTC.balance)).toFixed(3) > 0) {
        logIt({ title: 'btc balance', info: parseFloat(myBTC.balance) });
        console.log(`bitcoin -> ${currency}`);

        const lastMatch = await getLastOrder(myCurrency.id);
        // last match should be a deficit of the last transfer you made
        // aka, btc -> currency trade area should have deficit of currency, as we
        // last purchased btc with currency.
        const priceAtTimeOfSale = Math.abs(lastMatch) / myBTC.balance;
        const diffSinceLastTrade = marketBTC.price - priceAtTimeOfSale;
        console.log(diffSinceLastTrade);

        if (diffSinceLastTrade < -10) {
            reactivate(ONE_HOUR_MS);
            logIt({
                form: 'error',
                title: 'Keep on the look out for potential further investment, Price drop',
                info: diffSinceLastTrade,
            });
        } else if (diffSinceLastTrade > 10) {
            reactivate(FIFTEEN_MINS_MS);
            logIt({
                form: 'notice',
                title: 'BTC price rising, checking more frequently',
                info: diffSinceLastTrade,
            });
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

    // currency -> btc
    if (parseFloat(myCurrency.balance) > 1) {
        logIt({
            title: `${currency} Balance`,
            info: parseFloat(myCurrency.balance),
        });
        console.log(`${currency} -> bitcoin`);

        const lastMatch = await getLastOrder(myBTC.id);

        const btcPurchasePrice =
            myCurrency.balance / Math.abs(parseFloat(lastMatch));
        const diffSinceLastTrade = marketBTC.price - btcPurchasePrice;

        if (diffSinceLastTrade > 10) {
            reactivate(ONE_HOUR_MS);
            logIt({
                form: 'error',
                title: 'You bought bitcoin early. Has risen',
                info: diffSinceLastTrade,
            });
        } else if (diffSinceLastTrade < -10) {
            reactivate(FIFTEEN_MINS_MS);
            logIt({
                form: 'notice',
                title: 'BTC is rising, checking more often now.',
                info: diffSinceLastTrade,
            });
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
