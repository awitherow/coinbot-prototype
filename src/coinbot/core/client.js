//@flow

const gdax = require("gdax");
require("dotenv").config();
const { KEY, SECRET, PASS, ENDPOINT } = process.env;

if (!KEY || !SECRET || !PASS || !ENDPOINT) {
  throw new Error("Coinbase client environment variables not properly set.");
}

module.exports = {
  authClient: new gdax.AuthenticatedClient(KEY, SECRET, PASS, ENDPOINT),
  pubClient: (coinCurrency: string) => new gdax.PublicClient(coinCurrency)
};
