//@flow
const { stdNum } = require("../../../_helpers/math");

const PARAMS_MISSING = {
  advice: false,
  message: "missing parameters"
};

const THRESHOLD = 15;

function getChangeInfo(market: number, opening: number) {
  const changeInCoinUntilNow = market - opening;
  return {
    changeInCoinUntilNow,
    changePercent: stdNum(changeInCoinUntilNow / market * 100)
  };
}

function shouldPurchase(
  coin: string,
  marketCoin: number,
  openingPrice: number
) {
  if (!coin || !marketCoin || !openingPrice) {
    return PARAMS_MISSING;
  }

  const { changeInCoinUntilNow, changePercent } = getChangeInfo(
    marketCoin,
    openingPrice
  );

  // price has increased X percent
  if (changePercent > 0) {
    return {
      advice: false,
      message: `${coin} market too high to buy.`
    };
  }

  // price has decreased 5 percent or more
  if (changePercent <= -THRESHOLD) {
    const percentageDropped = Math.abs(changePercent);
    const message = `${coin} has dropped ${percentageDropped}%. Purchase advisable.`;

    return {
      advice: true,
      message
    };
  }

  if (changePercent <= 0) {
    return {
      advice: false,
      message: `${coin} market dropped ${changePercent}%, not yet significant.`
    };
  }

  return {
    advice: false,
    message: "not sure what happened here."
  };
}

function shouldSell(coin: string, marketCoin: number, openingPrice: number) {
  if (!coin || !marketCoin || !openingPrice) {
    return PARAMS_MISSING;
  }

  const { changeInCoinUntilNow, changePercent } = getChangeInfo(
    marketCoin,
    openingPrice
  );

  // price has decreased X percent
  if (changePercent < 0) {
    return {
      advice: false,
      message: `${coin} market too low to sell.`
    };
  }

  // price has increased 5 percent or more
  if (changePercent >= THRESHOLD) {
    const percentageDropped = Math.abs(changePercent);
    const message = `${coin} has increased ${percentageDropped}%. Sale advisable.`;

    return {
      advice: true,
      message
    };
  }

  if (changePercent >= 0) {
    return {
      advice: false,
      message: `${coin} market increased ${changePercent}%, not yet significant.`
    };
  }

  return {
    advice: false,
    message: "not sure what happened here."
  };
}

module.exports = {
  shouldPurchase,
  shouldSell
};
