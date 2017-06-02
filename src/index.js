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
const { getAccount, getRelevantCoinOrder } = require('./core/account');

// product related functions
const { getSnapshot } = require('./core/product');

type Millisecond =
    | FIVE_MINS_MS
    | FIFTEEN_MINS_MS
    | THIRTY_MINS_MS
    | ONE_HOUR_MS;

function reactivate(coin: string, time: Millisecond) {
    setInterval(() => check(coin), time);
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
                title: 'failed to run',
                info: e,
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

// also upon completion, it will be run on a setInterval determined on the
// decide() function that will be used later.
async function execute(
    coin: string,
    currency: string,
    { fulfill, reject }: PromiseMethods
) {
    logIt({
        title: `running ${coin} at`,
        info: moment().format('MMMM Do YYYY, h:mm:ss a'),
    });

    // get account balances for current coin and cash accounts.
    const coinBalance = await getAccount(coin);
    const cashAccount = await getAccount(currency);
    if (cashAccount instanceof Error || coinBalance instanceof Error) {
        return new Error('Could not get account based on your currency');
    }

    // check the market coin price for right now.
    const marketCoin = await getSnapshot(`${coin}-${cashAccount.currency}`);

    // get a smart coin order, depending on trading styles.
    const coinOrder = await getRelevantCoinOrder(
        cashAccount.id,
        `${coin}-${cashAccount.currency}`,
        parseFloat(Number(coinBalance.balance).toFixed(3))
    );

    if (marketCoin instanceof Error || coinOrder instanceof Error) {
        return new Error('Could not get market coin information');
    }

    return fulfill();
}
