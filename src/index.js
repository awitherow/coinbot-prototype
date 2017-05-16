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
const { getAccount, getLastCoinOrder } = require('./core/account');

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

    if (!currency) {
        return Error('Please set your CURRENCY env');
    }

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

    // get coin that is being used.
    const myCurrency = await getAccount(currency);
    const { orderType, coin, matches, amount } = await getLastCoinOrder(
        myCurrency.id
    );

    const [marketCoin, myCoin] = await Promise.all([
        getSnapshot(orderType),
        getAccount(coin),
    ]);

    // coin -> currency
    if (Number(parseFloat(myCoin.balance)).toFixed(3) > 0) {
        logIt({ title: `${coin} balance`, info: parseFloat(myCoin.balance) });
        console.log(`${coin} -> ${currency}`);

        // last match should be a deficit of the last transfer you made
        // aka, coin -> currency trade area should have deficit of currency, as we
        // last purchased coin with currency.
        const priceAtTimeOfSale = Math.abs(amount) / myCoin.balance;
        const diffSinceLastTrade = marketCoin.price - priceAtTimeOfSale;

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
                title: `${coin} price rising, checking more frequently`,
                info: diffSinceLastTrade,
            });
        } else if (diffSinceLastTrade > 20) {
            if (twilioActivated) {
                notifyUserViaText(
                    `SELL ${coin}! Significant difference: ${diffSinceLastTrade}.`
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

    // currency -> coin
    if (parseFloat(myCurrency.balance) > 1) {
        logIt({
            title: `${currency} Balance`,
            info: parseFloat(myCurrency.balance),
        });
        console.log(`${currency} -> ${coin}`);

        const priceAtTimeOfSale =
            myCurrency.balance / Math.abs(parseFloat(amount));
        const diffSinceLastTrade = marketCoin.price - priceAtTimeOfSale;

        if (diffSinceLastTrade > 10) {
            reactivate(ONE_HOUR_MS);
            logIt({
                form: 'error',
                title: `You bought ${coin} early. Has risen`,
                info: diffSinceLastTrade,
            });
        } else if (diffSinceLastTrade < -10) {
            reactivate(FIFTEEN_MINS_MS);
            logIt({
                form: 'notice',
                title: `${coin} is rising, checking more often now.`,
                info: diffSinceLastTrade,
            });
        } else if (diffSinceLastTrade < -20) {
            if (twilioActivated) {
                notifyUserViaText(
                    `Buy ${coin}! Significant difference: ${diffSinceLastTrade}.`
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
