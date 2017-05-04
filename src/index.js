// @flow
const moment = require('moment');
const logIt = require('./helpers/logger.js');
const {
    FIVE_MINS_MS,
    FIFTEEN_MINS_MS,
    THIRTY_MINS_MS,
    ONE_HOUR_MS,
} = require('./helpers/constants.js');
const { twilioActivated, notifyUserViaText } = require('./notifier/');
const { getAccount, getLastOrder } = require('./core/account');
const { getSnapshot } = require('./core/product');

type Millisecond =
    | FIVE_MINS_MS
    | FIFTEEN_MINS_MS
    | THIRTY_MINS_MS
    | ONE_HOUR_MS;

type Coin = 'BTC' | 'ETH' | 'LTC';
type Currency = 'BTC' | 'GBP' | 'EUR' | 'USD';
const ACCEPTED_CURRENCIES = ['BTC', 'GBP', 'EUR', 'USD'];

// reactivate takes a Millisecond and a Coin, both typed above.
// it sets the interval for that Millisecond passed, and attemptsRun with
// the coin selected after that interval.
function reactivate(time: Millisecond, coin: Coin) {
    setInterval(attemptRun([coin]), time);
    logIt({
        title: 'checking again',
        info: moment().add(time, 'milliseconds').fromNow(),
    });
}

// attemptRun takes an Array of Coin, takes the currency you wish to trade
// and iterates over the run function with your coin/currency combination.
function attemptRun(coins: Array<Coin>) {
    require('dotenv').config();
    const currency = process.env.CURRENCY;

    if (!currency || !ACCEPTED_CURRENCIES.indexOf(currency)) {
        return new Error('please check your currency env variable');
    }

    coins.map(async coin => {
        try {
            const res = await run(coin, currency);

            if (res instanceof Error) {
                return new Error(res.message);
            }

            reactivate(res, coin);
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

function run(coin: Coin, currency: Currency): Promise<Millisecond | Error> {
    return new Promise(async (resolve, reject) => {
        logIt({
            title: 'running at',
            info: moment().format('MMMM Do YYYY, h:mm:ss a'),
        });

        const [
            marketCoin,
            myCoinBalance,
            myCurrencyBalance,
        ] = await Promise.all([
            getSnapshot(`${coin}-${currency}`),
            getAccount(coin),
            getAccount(currency),
        ]);

        if (
            marketCoin instanceof Error ||
            myCoinBalance instanceof Error ||
            myCurrencyBalance instanceof Error
        ) {
            return reject(new Error('Getting required gdax info failed.'));
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
                    logIt({
                        form: 'error',
                        title: 'Keep on the look out for potential further investment, Price drop',
                        info: diffSinceLastTrade,
                    });
                    return resolve(ONE_HOUR_MS);
                } else if (diffSinceLastTrade > 10) {
                    logIt({
                        form: 'notice',
                        title: '${coin} price rising, checking more frequently',
                        info: diffSinceLastTrade,
                    });
                    return resolve(FIFTEEN_MINS_MS);
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
                    return resolve(FIVE_MINS_MS);
                } else {
                    logIt({
                        title: 'Price change not significant',
                        info: diffSinceLastTrade,
                    });
                    return resolve(THIRTY_MINS_MS);
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
                    logIt({
                        form: 'error',
                        title: 'You bought bitcoin early. Has risen',
                        info: diffSinceLastTrade,
                    });
                    return resolve(ONE_HOUR_MS);
                } else if (diffSinceLastTrade < -10) {
                    logIt({
                        form: 'notice',
                        title: `${coin} is rising, checking more often now.`,
                        info: diffSinceLastTrade,
                    });
                    return resolve(FIFTEEN_MINS_MS);
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
                    return resolve(FIVE_MINS_MS);
                } else {
                    logIt({
                        title: 'Price change not significant',
                        info: diffSinceLastTrade,
                    });
                    return resolve(THIRTY_MINS_MS);
                }
            }
        }
    });
}
