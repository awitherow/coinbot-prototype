// @flow

// helpers
const moment = require('moment');
const logIt = require('./helpers/logger.js');
const { stdNum } = require('./helpers/math.js');
const { twilioActivated, notifyUserViaText } = require('./notifier');
const { FIFTEEN_MINS_MS } = require('./helpers/constants.js');

const { getAccount } = require('./core/account');
const { getProductSnapshot, get24HourStats } = require('./core/product');
const { shouldPurchase, shouldSell } = require('./core/advisor');

const DEFAULT_COINS = ['BTC', 'ETH', 'LTC'];

type Payloads = Array<Payload>;
type Payload = {
    id: string,
    message: string,
    nextCheck?: number,
};

// check returns a fulfillment of having checked.
function check(coin: string): Promise<Payloads | Error> | Error {
    require('dotenv').config();
    const currency = process.env.CURRENCY;
    if (!currency) {
        return Error('Please set your CURRENCY env');
    }

    return new Promise((fulfill, reject) => {
        try {
            execute(coin, currency, { fulfill, reject });
        } catch (e) {
            Error(e);
        }
    });
}

// run loops over defined coins and checks the state of that coin against past trades.
(async function run() {
    // TODO: check coin currency here and automate which coins to get.
    let payload = [];
    let timeout = FIFTEEN_MINS_MS;
    for (let i = 0; i <= DEFAULT_COINS.length - 1; i++) {
        try {
            payload = await check(DEFAULT_COINS[i]);
        } catch (e) {
            logIt({
                form: 'error',
                message: e,
            });
            break;
        }

        if (Array.isArray(payload)) {
            payload.map(({ message, nextCheck }) => {
                if (nextCheck < FIFTEEN_MINS_MS) {
                    timeout = nextCheck;
                }
                logIt({
                    form: 'notice',
                    message,
                });
            });
        }
        console.log('-----------');
    }
    console.log('>>>>>>>>>>>>');
    logIt({
        form: 'notice',
        message: 'RUN COMPLETE >>>',
    });

    setTimeout(() => {
        run();
    }, timeout);

    logIt({
        message: `checking again in ${moment()
            .add(timeout, 'milliseconds')
            .fromNow()}`,
    });
    console.log('>>>>>>>>>>>>');
})();

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
    //  1) no coins, no money (reject)
    //  2) coins to sell
    //  3) money to spend
    // --------------------------

    const messages = [];

    // 1) no coins, no money (reject)
    if (parsedCoinBalance === 0 && parsedCurrencyBalance === 0) {
        return reject('Not enough trading money');
    }

    // 2) coins to sell
    if (parsedCoinBalance > 0) {
        const sellAdvice = shouldSell(coin, marketCoin, stats.open);
        const { advice, message, nextCheck } = sellAdvice;

        if (
            twilioActivated &&
            advice &&
            message &&
            !Boolean(process.env.TESTING)
        ) {
            notifyUserViaText(message);
        }

        let pkg = {
            id: 'sellAdvice',
            advice,
            message,
            nextCheck: null,
        };

        if (nextCheck) {
            pkg.nextCheck = nextCheck;
        }

        messages.push(pkg);
    }

    // 3) money to spend
    if (parsedCurrencyBalance > 0) {
        const purchaseAdvice = shouldPurchase(coin, marketCoin, stats.open);
        const { advice, message, nextCheck } = purchaseAdvice;

        if (
            twilioActivated &&
            advice &&
            message &&
            !Boolean(process.env.TESTING)
        ) {
            notifyUserViaText(message);
        }

        let pkg = {
            id: 'purchaseAdvice',
            advice,
            message,
        };

        if (nextCheck) {
            pkg.nextCheck = nextCheck;
        }

        messages.push(pkg);
    }

    return fulfill(messages);
}
