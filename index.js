const gdax = require('gdax');
const moment = require('moment');
const client = new gdax.PublicClient();

console.log('server started', moment().format('MMMM Do YYYY, h:mm:ss a'));

function getRecentActivity() {
    const latestBTCValue = getSnapshot();
    // const lastPurchase = getLastPurchaseByUser();
    // const lastSale = getLastSaleByUser();
    // if (latestBTCValue < lastSale) run buy algorithm, else getRecentActivity later
    // if (latestBTCValue > lastPurchase) run sale algorithm, else getRecentActivity later
    // const data = analyze();
    // decide();
}

function getSnapshot() {
    client.getProductTicker(function(err, res, data) {
        if (err) {
            console.error(err);
        } else {
            console.log(data);
            return data;
        }
    });
}

function getLastPurchaseByUser() {
    // do I want to do this on every getRecentActivity?
    // or do websocket event?
}
function getLastSaleByUser() {
    // do I want to do this on every getRecentActivity?
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
    // either getRecentActivity again on different intervals,
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
