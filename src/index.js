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

function reactivate(time: number, coin: string) {
    setInterval(attemptRun([coin]), time);
    logIt({
        title: 'checking again',
        info: moment().add(time, 'milliseconds').fromNow(),
    });
}

function attemptRun(coins: Array<string>) {
    require('dotenv').config();
    const currency = process.env.CURRENCY;
    if (!currency) {
        throw new Error('ENV variable CURRENCY is not defined!');
    }

    coins.map(async coin => {
        try {
            await run(coin, currency);
        } catch (e) {
            logIt({
                form: 'error',
                title: `failed to run for ${coin}-${currency}`,
                info: e,
            });
            reactivate(FIFTEEN_MINS_MS, coin);
        }
    });
}

const coins = ['BTC', 'ETH', 'LTC'];
attemptRun(coins);

// also upon completion, it will be run on a setInterval determined on the
// decide() function that will be used later.
async function run(coin: string, currency: string) {
    logIt({
        title: 'running at',
        info: moment().format('MMMM Do YYYY, h:mm:ss a'),
    });

    const [marketCoin, myCoinBalance, myCurrencyBalance] = await Promise.all([
        getSnapshot(`${coin}-${currency}`),
        getAccount(coin),
        getAccount(currency),
    ]);

    if (
        marketCoin instanceof Error ||
        myCoinBalance instanceof Error ||
        myCurrencyBalance instanceof Error
    ) {
        return new Error('Getting required gdax info failed.');
    }

    const lastMatch = await getLastOrder(myCurrencyBalance.id, {
        coin,
        currency,
    });

    // coin -> currency
    if (Number(parseFloat(myCoinBalance.balance)).toFixed(2) > 0) {
        logIt({
            title: `${coin} balance`,
            info: parseFloat(myCoinBalance.balance),
        });

        console.log(`${coin} -> ${currency}`);
        if (lastMatch < 0) {
            const priceAtTimeOfSale =
                Math.abs(lastMatch) / parseFloat(myCoinBalance.balance);
            const diffSinceLastTrade =
                parseFloat(marketCoin.price) - priceAtTimeOfSale;

            if (diffSinceLastTrade < -10) {
                reactivate(ONE_HOUR_MS, coin);
                logIt({
                    form: 'error',
                    title: 'Keep on the look out for potential further investment, Price drop',
                    info: diffSinceLastTrade,
                });
                return;
            } else if (diffSinceLastTrade > 10) {
                reactivate(FIFTEEN_MINS_MS, coin);
                logIt({
                    form: 'notice',
                    title: '${coin} price rising, checking more frequently',
                    info: diffSinceLastTrade,
                });
                return;
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
                reactivate(FIVE_MINS_MS, coin);
                return;
            } else {
                logIt({
                    title: 'Price change not significant',
                    info: diffSinceLastTrade,
                });
                reactivate(THIRTY_MINS_MS, coin);
                return;
            }
        }
    }

    if (parseFloat(myCurrencyBalance.balance) > 1) {
        logIt({
            title: `${coin} Balance`,
            info: parseFloat(myCurrencyBalance.balance),
        });

        console.log(`${coin} -> ${currency}`);
        if (lastMatch < 0) {
            const coinPurchasePrice =
                parseFloat(myCurrencyBalance.balance) /
                Math.abs(parseFloat(lastMatch));
            const diffSinceLastTrade =
                parseFloat(marketCoin.price) - coinPurchasePrice;

            if (diffSinceLastTrade > 10) {
                reactivate(ONE_HOUR_MS, coin);
                logIt({
                    form: 'error',
                    title: 'You bought bitcoin early. Has risen',
                    info: diffSinceLastTrade,
                });
                return;
            } else if (diffSinceLastTrade < -10) {
                reactivate(FIFTEEN_MINS_MS, coin);
                logIt({
                    form: 'notice',
                    title: `${coin} is rising, checking more often now.`,
                    info: diffSinceLastTrade,
                });
                return;
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
                reactivate(FIVE_MINS_MS, coin);
                return;
            } else {
                logIt({
                    title: 'Price change not significant',
                    info: diffSinceLastTrade,
                });
                reactivate(THIRTY_MINS_MS, coin);
                return;
            }
        }
    }
}
