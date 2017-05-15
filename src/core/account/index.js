// @flow

const { authClient } = require('../client');
const logIt = require('../../helpers/logger');

type Account = {
    'id': string,
    'currency': string,
    'balance': string,
    'available': string,
    'hold': string,
    'profile_id': string,
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
            return resolve(data.filter(acct => acct.currency === type)[0]);
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
                data.filter(trade => trade.type !== 'transfer').slice(0, 25)
            );
        })
    );
}

type LastCoinOrder = {
    orderType:
        | 'BTC-USD'
        | 'BTC-EUR'
        | 'BTC-GBP'
        | 'ETH-USD'
        | 'LTC-USD'
        | 'ETH-BTC'
        | 'LTC-BTC',
    coin: 'BTC' | 'ETH' | 'LTC',
    matches: Array<Match>,
    amount: number,
};

// getLastCoinOrder gets last order of the account used.
// gets BTC only at the moment, ensures if an order is split it will find
// all parts of that order and get the sum of all
async function getLastCoinOrder(id: string): LastCoinOrder {
    const allMatches = await getAccountHistory(id);
    const lastMatch = allMatches[0];
    const orderType = lastMatch.details.product_id;
    const matches = allMatches.filter(
        a =>
            a.details.product_id === orderType &&
            a.created_at === lastMatch.created_at
    );

    return {
        orderType,
        coin: orderType.split('-')[0],
        matches,
        amount: matches
            .filter(m => m.details.order_id === lastMatch.details.order_id)
            .reduce((acc, m) => acc + parseFloat(m.amount), 0),
    };
}

module.exports = {
    getAccount,
    getLastCoinOrder,
};
