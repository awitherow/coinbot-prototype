// @flow

const { authClient } = require("../client");
const logIt = require("../../../_helpers/logger");

type Account = {
  "id": string,
  "balance": number,
  "currency": string,
};

// getAccount is passed a type of account, by string.
// it then resolves the first account of the user
// https://docs.gdax.com/#list-accounts
function getAccount(currency: string): Promise<Account | Error> {
  return new Promise((resolve, reject) =>
    authClient.getAccounts((err, res, data) => {
      if (err) {
        return reject(new Error(err));
      }
      if (data.message) {
        return reject(new Error(data.message));
      }
      const acct = data.filter(acct => acct.currency === currency)[0];
      return resolve({
        id: acct.id,
        balance: parseFloat(acct.balance),
        currency: acct.currency,
      });
    })
  );
}

type Transaction = {
  "id": string,
  "created_at": string,
  "amount": string,
  "balance": string,
  "type": "transfer" | "match" | "fee" | "rebate",
  "details": {
    "order_id": string,
    "trade_id": string,
    "product_id": string,
  },
};

// getRecentAccountHistory returns the latest 25 account transactions, without transfers.
// https://docs.gdax.com/#get-account-history
function getRecentAccountHistory(
  currencyId: string
): Promise<Array<Transaction> | Error> {
  return new Promise((resolve, reject) =>
    authClient.getAccountHistory(
      currencyId,
      (err, res, data: Array<Transaction>) => {
        if (err) {
          return reject(new Error(err));
        }
        if (data.message) {
          return reject(new Error(data.message));
        }
        return resolve(
          // transfer is ignored as we do not want to track transfers from coinbase, yet.
          data.filter(trade => trade.type !== "transfer")
        );
      }
    )
  );
}

// A CoinOrder is a collection of transactions related to one order.
type CoinOrder = {
  matches: Array<Transaction>,
  amount: number,
};

// prepareLastOrder takes a sorted(date) array of matches and a specific coinCurrency
// type (ETH-USD, LTC-USD, etc...) and returns a CoinOrder.
function prepareLastOrder(
  matches: Array<Transaction>,
  coinCurrency: string
): CoinOrder {
  const lastMatchesOfType = matches.filter(match => {
    return match.details.product_id === coinCurrency;
  });
  const lastMatchDetails = lastMatchesOfType[0].details;
  const orderType = lastMatchDetails.product_id;
  const orderMatches = matches.filter(
    ({ details }) =>
      details.product_id === orderType &&
      details.order_id === lastMatchDetails.order_id
  );

  return {
    matches: orderMatches,
    amount: orderMatches.reduce((acc, m) => acc + parseFloat(m.amount), 0),
  };
}

// getLastCoinOrder gets last order of the account used.
async function getLastCoinOrder(
  accountID: string,
  coinCurrency: string
): Promise<CoinOrder | Error> {
  const allMatches = await getRecentAccountHistory(accountID);
  if (allMatches instanceof Error) {
    return allMatches;
  }

  return prepareLastOrder(allMatches, coinCurrency);
}

module.exports = {
  getAccount,
  getLastCoinOrder,
  prepareLastOrder,
};
