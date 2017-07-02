// @flow
const moment = require("moment");

const { getAccount } = require("./core/account");
const { getProductSnapshot, get24HourStats } = require("./core/product");
const { shouldPurchase, shouldSell } = require("./core/advisor");

const { twilioActivated, notifyUserViaText } = require("./notifier");

const logIt = require("./helpers/logger.js");
const { stdNum } = require("./helpers/math.js");
const { FIFTEEN_MINS_MS } = require("./helpers/constants.js");

const DEFAULT_COINS = ["BTC", "ETH", "LTC"];

type Decisions = Array<Decision>;
type Decision = {
  id: string,
  advice: boolean,
  message: string
};

// check returns a fulfillment of having checked.
function check(coin: string): Promise<Decisions | Error> | Error {
  require("dotenv").config();
  const currency = process.env.CURRENCY;
  if (!currency) {
    return Error("Please set your CURRENCY env");
  }

  return new Promise((fulfill, reject) => {
    try {
      execute(coin, currency, { fulfill, reject });
    } catch (e) {
      Error(e);
    }
  });
}

// run loops over defined coins and checks the state of that coin against past trades.
async function run() {
  // TODO: check coin currency here and automate which coins to get.
  let decisions = [];
  for (let i = 0; i <= DEFAULT_COINS.length - 1; i++) {
    try {
      decisions = await check(DEFAULT_COINS[i]);
    } catch (e) {
      logIt({
        form: "error",
        message: e
      });
      break;
    }

    if (Array.isArray(decisions)) {
      decisions.map(({ id, advice, message }) =>
        logIt({
          form: "notice",
          message
        })
      );
    }
    console.log("-----------");
  }
  console.log(">>>>>>>>>>>>");
  logIt({
    form: "notice",
    message: "RUN COMPLETE >>>"
  });
  logIt({
    message: `checking again in ${moment()
      .add(FIFTEEN_MINS_MS, "milliseconds")
      .fromNow()}`
  });
  console.log(">>>>>>>>>>>>");
}

run();
setInterval(function() {
  run();
}, FIFTEEN_MINS_MS);

type PromiseMethods = {
  fulfill: Function,
  reject: Function
};

// execute gathers all relevant information on the trades you are making
// and attempts to provide a recommendation to the user on what to do.
async function execute(
  coin: string,
  currency: string,
  { fulfill, reject }: PromiseMethods
) {
  logIt({
    message: `running ${coin} at ${moment().format("MMMM Do YYYY, h:mm:ss a")}`
  });

  // set standard 'COIN-CURRENCY' trade symbol (ex: BTC-USD)
  const coinCurrency = `${coin}-${currency}`;

  // get coin that is being used.
  const myCurrency = await getAccount(currency);
  if (myCurrency instanceof Error) {
    return reject("Could not get account based on your currency");
  }

  // Get account coin balance.
  const coinBalance = await getAccount(coin);
  if (coinBalance instanceof Error) {
    return reject("Could not get coin balance");
  }

  // Get current market price of coin
  const marketCoin = await getProductSnapshot(coinCurrency);
  if (marketCoin instanceof Error) {
    return reject("Could not get market coin information");
  }

  const stats = await get24HourStats(coinCurrency);
  if (stats instanceof Error) {
    return reject("Could not get 24 hour stats");
  }

  // parse coin and currency balance to be usable numbers.
  const parsedCoinBalance = stdNum(coinBalance.balance);
  const parsedCurrencyBalance = stdNum(myCurrency.balance);

  // decision tree
  //  1) no coins, no money (reject)
  //  2) coins to sell
  //  3) money to spend
  // --------------------------

  const decisions = [];

  // 1) no coins, no money (reject)
  if (parsedCoinBalance === 0 && parsedCurrencyBalance === 0) {
    return reject("Not enough trading money");
  }

  // 2) coins to sell
  if (parsedCoinBalance > 0) {
    const sellAdvice = shouldSell(coin, marketCoin, stats.open);
    const { advice, message } = sellAdvice;

    if (twilioActivated && advice && message && !Boolean(process.env.TESTING)) {
      notifyUserViaText(message);
    }

    decisions.push({
      id: "sellAdvice",
      advice,
      message
    });
  }

  // 3) money to spend
  if (parsedCurrencyBalance > 0) {
    const purchaseAdvice = shouldPurchase(coin, marketCoin, stats.open);
    const { advice, message } = purchaseAdvice;

    if (twilioActivated && advice && message && !Boolean(process.env.TESTING)) {
      notifyUserViaText(message);
    }

    decisions.push({
      id: "purchaseAdvice",
      advice,
      message
    });
  }

  return fulfill(decisions);
}
