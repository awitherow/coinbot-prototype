// @flow

// helpers
const moment = require('moment');
const logIt = require('./helpers/logger.js');
const { stdNum } = require('./helpers/math.js');
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
const { getProductSnapshot } = require('./core/product');

type Millisecond =
    | FIVE_MINS_MS
    | FIFTEEN_MINS_MS
    | THIRTY_MINS_MS
    | ONE_HOUR_MS;

function reactivate(time: Millisecond) {
    setInterval(check, time);
    logIt({
        title: 'checking again',
        info: moment().add(time, 'milliseconds').fromNow(),
    });
}

// check returns a fulfillment of having checked.
function check(coin: string) {
    require('dotenv').config();
    const currency = process.env.CURRENCY;

    if (!currency) {
        return Error('Please set your CURRENCY env');
    }

    return new Promise(fulfill => {
        try {
            execute(coin, currency, fulfill);
        } catch (e) {
            reactivate(FIFTEEN_MINS_MS);
            return Error(e);
        }
    });
}

// init loops over defined coins and checks the state of that coin against past trades.
async function init() {
    const coins = ['BTC', 'ETH', 'LTC'];

    for (let i = 0; i <= coins.length - 1; i++) {
        try {
            await check(coins[i]);
        } catch (e) {
            return logIt({
                form: 'error',
                title: 'failed to run',
                info: e,
            });
        }
    }
}

init();

// also upon completion, it will be run on a setInterval determined on the
// decide() function that will be used later.
async function execute(coin: string, currency: string, fulfill: Function) {
    logIt({
        title: `running ${coin} at`,
        info: moment().format('MMMM Do YYYY, h:mm:ss a'),
    });

    // get coin that is being used.
    const myCurrency = await getAccount(currency);
    if (myCurrency instanceof Error) {
        return new Error('Could not get account based on your currency');
    }

    const lastCoinOrder = await getLastCoinOrder(myCurrency, coin);
    if (lastCoinOrder instanceof Error) {
        return new Error('Could not fetch latest coin order');
    }

    const { orderType, matches, amount } = lastCoinOrder;
    const [marketCoin, coinBalance] = await Promise.all([
        getProductSnapshot(orderType),
        getAccount(coin),
    ]);

    if (marketCoin instanceof Error || coinBalance instanceof Error) {
        return new Error('Could not get market coin information');
    }

    // coin -> currency
    if (stdNum(coinBalance.balance) > 0) {
        logIt({
            title: `${coin} balance`,
            info: parseFloat(coinBalance.balance),
        });
        console.log(`${coin} -> ${currency}`);

        // last match should be a deficit of the last transfer you made
        // aka, coin -> currency trade area should have deficit of currency, as we
        // last purchased coin with currency.
        const priceAtTimeOfSale = Math.abs(amount) / coinBalance.balance;
        const diffSinceLastTrade = marketCoin - priceAtTimeOfSale;

        if (diffSinceLastTrade < -10) {
            reactivate(ONE_HOUR_MS);
            logIt({
                form: 'error',
                title: 'Keep on the look out for potential further investment, Price drop',
                info: diffSinceLastTrade,
            });
            fulfill();
        } else if (diffSinceLastTrade > 10) {
            reactivate(FIFTEEN_MINS_MS);
            logIt({
                form: 'notice',
                title: `${coin} price rising, checking more frequently`,
                info: diffSinceLastTrade,
            });
            fulfill();
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
            fulfill();
        } else {
            logIt({
                title: 'Price change not significant',
                info: diffSinceLastTrade,
            });
            reactivate(THIRTY_MINS_MS);
            fulfill();
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
        const diffSinceLastTrade = marketCoin - priceAtTimeOfSale;

        if (diffSinceLastTrade > 10) {
            reactivate(ONE_HOUR_MS);
            logIt({
                form: 'error',
                title: `You bought ${coin} early. Has risen`,
                info: diffSinceLastTrade,
            });
            fulfill();
        } else if (diffSinceLastTrade < -10) {
            reactivate(FIFTEEN_MINS_MS);
            logIt({
                form: 'notice',
                title: `${coin} is rising, checking more often now.`,
                info: diffSinceLastTrade,
            });
            fulfill();
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
            fulfill();
        } else {
            logIt({
                title: 'Price change not significant',
                info: diffSinceLastTrade,
            });
            reactivate(THIRTY_MINS_MS);
            fulfill();
        }
    }

    fulfill('Nothing found');
}
