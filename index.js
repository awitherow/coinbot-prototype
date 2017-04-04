const gdax = require('gdax');
const client = new gdax.PublicClient();

console.log('server started @', Date.now());

function snapshot() {
    client.getProductTicker(function(err, res, data) {
        if (err) {
            console.error(err);
        } else {
            console.log(data);
        }
    });
}

snapshot();
