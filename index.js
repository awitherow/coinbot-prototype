const gdax = require('gdax');
const moment = require('moment');
const client = new gdax.PublicClient();

require('dotenv').config();
const { KEY, SECRET, PASS, ENDPOINT } = process.env;
const authClient = new gdax.AuthenticatedClient(KEY, SECRET, PASS, ENDPOINT);

console.log('server started', moment().format('MMMM Do YYYY, h:mm:ss a'));

activate();

async function activate() {
    const latestBTCValue = await getSnapshot();
    console.log(latestBTCValue.price);
    const btcAccount = await getAccount('BTC');
    const usdAccount = await getAccount('USD');
    console.log(btcAccount, usdAccount);
    const latestAction = await getAccountHistory(btcAccount.id);
    console.log(latestAction);
    // if (latestBTCValue < lastSale) run buy algorithm, else activate later
    // if (latestBTCValue > lastPurchase) run sale algorithm, else activate later
    // const data = analyze();
    // decide();
}

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

function getAccount(type) {
    return new Promise((resolve, reject) =>
        authClient.getAccounts((err, res, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.filter(acct => acct.currency === type)[0]);
        }));
}

function getAccountHistory(id) {
    return new Promise((resolve, reject) =>
        authClient.getAccountHistory(id, (err, res, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        }));
}

function getLastSaleByUser() {
    // do I want to do this on every activate?
    // or do websocket event?
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
