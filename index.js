// gdax related
const gdax = require('gdax');
const client = new gdax.PublicClient();

// project related
const moment = require('moment');
require('dotenv').config();
const { KEY, SECRET, PASS, ENDPOINT } = process.env;

// console log helpers
const logIt = require('./src/helpers/logger.js');

// intialize authorized client.
const authClient = new gdax.AuthenticatedClient(KEY, SECRET, PASS, ENDPOINT);
logIt({
    title: 'server started',
    info: moment().format('MMMM Do YYYY, h:mm:ss a')
});
activate();

// activate is run on start
// also upon completion, it will be run on a setInterval determined on the
// decide() function that will be used later.
async function activate() {
    const marketBTC = await getSnapshot();
    const myBTC = await getAccount('BTC');
    const myUSD = await getAccount('USD');
    const lastAction = await getAccountHistory(myBTC.id);

    if (parseFloat(myBTC.balance)) {
        logIt({ title: 'btc balance', info: parseFloat(myBTC.balance) });
    }

    if (parseFloat(myUSD.balance)) {
        logIt({
            title: 'usd balance',
            info: parseFloat(myUSD.balance)
        });

        const lastBTCPurchase = lastAction.filter(
            a => a.details.product_id === 'BTC-USD'
        )[0];

        // ensure last trade was bitcoin.
        if (lastBTCPurchase) {
            const btcPurchasePrice = myUSD.balance /
                Math.abs(parseFloat(lastBTCPurchase.amount));
            const diffSinceLastTrade = marketBTC.price - btcPurchasePrice;

            if (diffSinceLastTrade > 25) {
                logIt({
                    type: 'error',
                    title: 'whoops, bought early. has risen',
                    info: diffSinceLastTrade
                });
                // send text
                setInterval(activate, 7200000); // 2 hours
            } else if (diffSinceLastTrade < -50) {
                logIt({
                    title: 'time to buy! different is significant',
                    info: diffSinceLastTrade
                });
                // send text
                setInterval(activate, 1800000); // 30 minutes
            } else {
                logIt({
                    title: 'difference',
                    info: diffSinceLastTrade
                });
                // send text
                setInterval(activate, 14400000); // 4 hours
                logIt({
                    title: 'checking again at',
                    info: moment().add(4, 'hours')
                });
            }
        }
    }

    // if user has USD (marketBTC < lastSale) run buy analyze, else activate later
    // analyze(sale || buy, action && latest value).then(decide && theory);
}

// getSnapshot returns a Promise that checks the products current status
// this seems to be set to BTC automatically.
// https://docs.gdax.com/#get-product-ticker
function getSnapshot() {
    return new Promise((resolve, reject) =>
        client.getProductTicker((err, res, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        }));
}

// getAccount is passed a type of account, by string.
// it then resolves the first account of the user
// https://docs.gdax.com/#list-accounts
function getAccount(type) {
    return new Promise((resolve, reject) =>
        authClient.getAccounts((err, res, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.filter(acct => acct.currency === type)[0]);
        }));
}

// getAccountHistory returns the latest 10 account events.
// https://docs.gdax.com/#get-account-history
function getAccountHistory(id) {
    return new Promise((resolve, reject) =>
        authClient.getAccountHistory(id, (err, res, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.filter(trade => trade.type === 'match'));
        }));
}
