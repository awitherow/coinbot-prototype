const gdax = require('gdax');
const moment = require('moment');
const client = new gdax.PublicClient();

require('dotenv').config();
const { KEY, SECRET, PASS, ENDPOINT } = process.env;
const authClient = new gdax.AuthenticatedClient(KEY, SECRET, PASS, ENDPOINT);

console.log('server started', moment().format('MMMM Do YYYY, h:mm:ss a'));

activate();

// activate is run on start
// also upon completion, it will be run on a setInterval determined on the
// decide() function that will be used later.
async function activate() {
    const latestBTCValue = await getSnapshot();
    console.log(latestBTCValue);
    const btcAccount = await getAccount('BTC');
    const usdAccount = await getAccount('USD');
    console.log(btcAccount, usdAccount);
    const latestAction = await getAccountHistory(btcAccount.id);
    console.log(latestAction); // will get lastPurchase/lastSale from here
    // if user has btc, and (latestBTCValue > lastPurchase) run sale analyze, else activate later
    // if user has USD (latestBTCValue < lastSale) run buy analyze, else activate later
    // analyze(sale || buy, action && latest value).then(decide);
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
            resolve(data);
        }));
}

function analyze() {
    return {
        // get last 8 snapshots from json storage
        // analyze the trend {(ascend, descend), (velocity)}
    };
}

function decide() {
    // based on the velocity and trend direction,
    // either activate again on different intervals,
    // or recommendActionToUser() && handleMoneyTheoretically();
}

function recommendActionToUser() {
    // connect to messaging service
    // send direct message
}

function handleMoneyTheoretically() {
    // do fake buy or sell based on recommendation
    // store values
    // analyze theoretical actions
}
