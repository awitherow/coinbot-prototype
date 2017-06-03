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

const { getAccount, getLastCoinOrder } = require('./core/account');
const { getProductSnapshot, get24HourStats } = require('./core/product');
const { advisePurchase } = require('./core/advisor');

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

    const stats = await get24HourStats(coinCurrency);
    if (stats instanceof Error) {
        return reject('Could not get 24 hour stats');
    }

    // parse coin and currency balance to be usable numbers.
    const parsedCoinBalance = parseFloat(
        Number(coinBalance.balance).toFixed(3)
    );
    const parsedCurrencyBalance = parseFloat(
        Number(myCurrency.balance).toFixed(3)
    );

    // decision tree
    //  1) no coins, no money (reject immediately)
    //  2) coins, money to spend ()
    //  3) coins, no money to spend (sell)
    //  4) no coins, money to spend (purchase)
    // --------------------------

    // 4) no coins, money to spend (purchase)
    if (parsedCoinBalance === 0 && parsedCurrencyBalance > 0) {
        const purchaseAdviseable = advisePurchase(coin, marketCoin, stats.open);
        console.log(purchaseAdviseable);
    }

    if (parsedCoinBalance > 0) {
    }

    return reject(`Could not take action on ${coin}`);
}
