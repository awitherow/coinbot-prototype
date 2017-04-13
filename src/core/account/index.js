// @flow
const client = require('../client');

// getAccount is passed a type of account, by string.
// it then resolves the first account of the user
// https://docs.gdax.com/#list-accounts
function getAccount(type: string) {
    return new Promise((resolve, reject) =>
        client.getAccounts((err, res, data) => {
            if (err) {
                reject(err);
            }
            if (data.message) {
                reject(data.message);
            }
            resolve(data.filter(acct => acct.currency === type)[0]);
        }));
}

// getMatches returns the latest 10 account events.
// https://docs.gdax.com/#get-account-history
function getMatches(id: string) {
    return new Promise((resolve, reject) =>
        client.getAccountHistory(id, (err, res, data) => {
            if (err) {
                reject(err);
            }
            if (data.message) {
                reject(data.message);
            }
            resolve(data.filter(trade => trade.type === 'match'));
        }));
}

module.exports = {
    getAccount,
    getMatches
};
