// @flow

const { authClient } = require('../client');
const logIt = require('../../helpers/logger');

type Account = {
    'id': string,
    'balance': number,
    'currency': string,
};

// getAccount is passed a type of account, by string.
// it then resolves the first account of the user
// https://docs.gdax.com/#list-accounts
function getAccount(type: string): Promise<Account | Error> {
    return new Promise((resolve, reject) =>
        authClient.getAccounts((err, res, data) => {
            if (err) {
                return reject(new Error(err));
            }
            if (data.message) {
                return reject(new Error(data.message));
            }
            const acct = data.filter(acct => acct.currency === type)[0];
            return resolve({
                id: acct.id,
                balance: parseFloat(acct.balance),
                currency: acct.currency,
            });
        })
    );
}

type Match = {
    'id': string,
    'created_at': string,
    'amount': string,
    'balance': string,
    'type': 'transfer' | 'match' | 'fee' | 'rebate',
    'details': {
        'order_id': string,
        'trade_id': string,
        'product_id': string,
    },
};

// getAccountHistory returns the latest 10 account events.
// https://docs.gdax.com/#get-account-history
function getAccountHistory(id: string): Promise<Array<Match> | Error> {
    return new Promise((resolve, reject) =>
        authClient.getAccountHistory(id, (err, res, data: Array<Match>) => {
            if (err) {
                return reject(new Error(err));
            }
            if (data.message) {
                return reject(new Error(data.message));
            }
            return resolve(
                // transfer is ignored as we do not want to track transfers
                // from coinbase. they will simply appear as new budget
                // to be used by the app. slicing 0-25 for later performance
                // and liklihood my order will not get split that bad.
                data.filter(trade => trade.type !== 'transfer')
            );
        })
    );
}

type CoinOrder = {
    type: 'purchase' | 'sale',
    howMuch: number,
    cost: number,
};

// prepareRelevantOrder takes a sorted(date) array of matches and a specific coinCurrency
// type (ETH-USD, LTC-USD, etc...) and returns a CoinOrder.
function prepareRelevantOrder(
    matches: Array<Match>,
    currency: string,
    balance: number
): CoinOrder {
    console;
    // psuedo new
    // attempt = 0;
    // relevantActions = []
    // underThredshold = attempt <= balance+*0.10
    // while this is less than continue to loop through matches
    // - push order id into releventActions
    // - check that attemptToMatchBalance does not exceed balance+*0.10
    // - add to total of attemptToMatchBalance
    // then get largest of all orders
    // if another large purchase makes up 25% or more of the attempt
    // average the cost of these purchases
    // attempt to mitigate potential losses here

    return {
        type: 'sale',
        howMuch: 2,
        cost: 50,
    };
}

// getRelevantCoinOrder gets last order of the account in this run.
async function getRelevantCoinOrder(
    accountID: string,
    coinCurrency: string,
    coinBalance: number
): Promise<CoinOrder | Error> {
    const allMatches = await getAccountHistory(accountID);
    if (allMatches instanceof Error) {
        return allMatches;
    }

    console.log(
        JSON.stringify(
            getLastCurrencyMatches(allMatches, coinCurrency).slice(0, 10)
        )
    );

    return prepareRelevantOrder(
        getLastCurrencyMatches(allMatches, coinCurrency),
        coinCurrency,
        coinBalance
    );
}

// filters matches for all COIN-CURRENCY matches.
const getLastCurrencyMatches = (m, cc) =>
    m.filter(match => {
        return match.details.product_id === cc;
    });

module.exports = {
    getAccount,
    getRelevantCoinOrder,
    prepareRelevantOrder,
};
