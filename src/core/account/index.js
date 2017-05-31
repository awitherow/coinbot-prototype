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
    orderType: string,
    matches: Array<Match>,
    amount: number,
};

// prepareLastOrder takes a sorted(date) array of matches and returns a CoinOrder.
function prepareLastOrder(
    matches: Array<Match>,
    coinCurrency: string
): CoinOrder {
    const lastMatchesOfType = matches.filter(match => {
        return match.details.product_id === coinCurrency;
    })[0];
    const lastMatchDetails = matches[0].details;
    const orderType = lastMatchDetails.product_id;
    matches = matches.filter(
        ({ details }) =>
            details.product_id === orderType &&
            details.order_id === lastMatchDetails.order_id
    );

    return {
        orderType,
        matches,
        amount: matches.reduce((acc, m) => acc + parseFloat(m.amount), 0),
    };
}

// getCoinOrder gets last order of the account used.
// gets BTC only at the moment, ensures if an order is split it will find
// all parts of that order and get the sum of all
async function getCoinOrder(
    account: Account,
    coin: string
): Promise<CoinOrder | Error> {
    const allMatches = await getAccountHistory(account.id);
    if (allMatches instanceof Error) {
        return allMatches;
    }

    return prepareLastOrder(allMatches, `${coin}-${account.currency}`);
}

module.exports = {
    getAccount,
    getCoinOrder,
    prepareLastOrder,
};
