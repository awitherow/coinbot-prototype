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
const { getProductSnapshot, get24HourStats } = require('./core/product');

type Millisecond =
    | FIVE_MINS_MS
    | FIFTEEN_MINS_MS
    | THIRTY_MINS_MS
    | ONE_HOUR_MS;

function reactivate(coin: string, time: Millisecond) {
    setInterval(() => check(coin), time);
    logIt({
        message: `checking again in ${moment()
            .add(time, 'milliseconds')
            .fromNow()}`,
    });
}

// check returns a fulfillment of having checked.
function check(coin: string) {
    require('dotenv').config();
    const currency = process.env.CURRENCY;
    if (!currency) {
        return Error('Please set your CURRENCY env');
    }

    return new Promise((fulfill, reject) => {
        try {
            execute(coin, currency, { fulfill, reject });
        } catch (e) {
            reactivate(coin, FIFTEEN_MINS_MS);
            Error(e);
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
            await reactivate(coins[i], FIFTEEN_MINS_MS);
            logIt({
                form: 'error',
                message: e,
            });
        }
        console.log('-----------');
    }
}

init();

type PromiseMethods = {
    fulfill: Function,
    reject: Function,
};

// execute gathers all relevant information on the trades you are making
// and attempts to provide a recommendation to the user on what to do.
async function execute(
    coin: string,
    currency: string,
    { fulfill, reject }: PromiseMethods
) {
    logIt({
        message: `running ${coin} at ${moment().format('MMMM Do YYYY, h:mm:ss a')}`,
    });

    // set standard 'COIN-CURRENCY' trade symbol (ex: BTC-USD)
    const coinCurrency = `${coin}-${currency}`;

    // get coin that is being used.
    const myCurrency = await getAccount(currency);
    if (myCurrency instanceof Error) {
        return reject('Could not get account based on your currency');
    }

    // get the last coin order of coin and currency combo.
    const lastCoinOrder = await getLastCoinOrder(myCurrency.id, coinCurrency);
    if (lastCoinOrder instanceof Error) {
        return reject('Could not fetch latest coin order');
    }

    // Get account coin balance.
    const coinBalance = await getAccount(coin);
    if (coinBalance instanceof Error) {
        return reject('Could not get coin balance');
    }

    // Get current market price of coin
    const marketCoin = await getProductSnapshot(coinCurrency);
    if (marketCoin instanceof Error) {
        return reject('Could not get market coin information');
    }

    // parse coin and currency balance to be usable numbers.
    const parsedCoinBalance = parseFloat(
        Number(coinBalance.balance).toFixed(3)
    );
    const parsedCurrencyBalance = parseFloat(
        Number(myCurrency.balance).toFixed(3)
    );

    // decision tree
    //  1) no coins, money to spend (purchase)
    //  2) coins, no money to spend (sell)
    //  3) coins, money to spend (sell) (is there a difference really between 2 and 3?)
    // --------------------------

    // 1) no coins, money to spend
    if (parsedCoinBalance === 0 && parsedCurrencyBalance > 0) {
        logIt({
            message: `${coin} balance empty, checking last 24 hour stats`,
        });
        const stats = await get24HourStats(coinCurrency);
        if (stats instanceof Error) {
            return reject('Could not get 24 hour stats');
        }

        const changeInCoinUntilNow = marketCoin - stats.open;
        const changePercent = parseFloat(
            Number(changeInCoinUntilNow / marketCoin * 100).toFixed(3)
        );

        const percentageDropWatch = -5;

        // price has increased X percent
        if (changePercent > 0) {
            return reject(`${coin} market too high to buy.`);
        }

        // price has decreased 5 percent or more
        if (changePercent <= percentageDropWatch) {
            const percentageDropped = Math.abs(changePercent);
            const message = `${coin} has dropped ${percentageDropped}%. Purchase advisable.`;

            if (twilioActivated) {
                notifyUserViaText(message);
            } else {
                return fulfill(message);
            }
        }

        if (changePercent <= 0) {
            return reject(
                `${coin} market dropped ${changePercent}%, not yet significant.`
            );
        }
    }

    return reject(`Could not take action on ${coin}`);
}
