const { stdNum } = require('../../helpers/math');

const {
    FIFTEEN_MINS_MS,
    TEN_MINS_MS,
    FIVE_MINS_MS,
} = require('../../helpers/constants');

const PARAMS_MISSING = {
    advice: false,
    message: 'missing parameters',
};

function prepareFeedback(payload) {
    console.log('HELLO!', Object.assign({}, DEFAULT_MESSAGE_PROPS, payload));
    return Object.assign({}, DEFAULT_MESSAGE_PROPS, payload);
}

const THRESHOLD = 5;

function getChangeInfo(market, opening) {
    const changeInCoinUntilNow = market - opening;
    return {
        changeInCoinUntilNow,
        changePercent: stdNum(changeInCoinUntilNow / market * 100),
    };
}

function shouldPurchase(coin, marketCoin, openingPrice) {
    if (!coin || !marketCoin || !openingPrice) {
        return prepareFeedback(PARAMS_MISSING);
    }

    const { changeInCoinUntilNow, changePercent } = getChangeInfo(
        marketCoin,
        openingPrice
    );

    // price has increased X percent
    if (changePercent > 0) {
        return {
            advice: false,
            message: `${coin} market too high to buy.`,
        };
    }

    // price has decreased 5 percent or more
    if (changePercent <= -THRESHOLD) {
        const percentageDropped = Math.abs(changePercent);
        const message = `${coin} has dropped ${percentageDropped}%. Purchase advisable.`;

        return {
            advice: true,
            message,
        };
    }

    if (changePercent <= 0) {
        return {
            advice: false,
            message: `${coin} market dropped ${changePercent}%, not yet significant.`,
        };
    }
}

function shouldSell(coin, marketCoin, openingPrice) {
    if (!coin || !marketCoin || !openingPrice) {
        return PARAMS_MISSING;
    }

    const { changeInCoinUntilNow, changePercent } = getChangeInfo(
        marketCoin,
        openingPrice
    );

    // price has decreased X percent
    if (changePercent < 0) {
        // holding coin & price is decreasing... you should have most likely sold.
        return {
            advice: false,
            message: `${coin} market too low to sell.`,
        };
    }

    // price has increased 5 percent or more
    if (changePercent >= THRESHOLD) {
        const payload = {
            advice: true,
        };
        const percentageDropped = Math.abs(changePercent);
        payload.message = `${coin} has increased ${percentageDropped}%. Sale advisable.`;

        if (changePercent >= THRESHOLD * 2) {
            payload.nextCheck = TEN_MINS_MS;
        }

        if (changePercent >= THRESHOLD * 3) {
            payload.nextCheck = FIVE_MINS_MS;
        }

        return payload;
    }

    if (changePercent >= 0) {
        return {
            advice: false,
            message: `${coin} market increased ${changePercent}%, not yet significant.`,
        };
    }
}

module.exports = {
    shouldPurchase,
    shouldSell,
};
