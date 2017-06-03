const { twilioActivated, notifyUserViaText } = require('../../notifier');

function advisePurchase(coin, marketCoin, openingPrice) {
    if (!coin || !marketCoin || !openingPrice) {
        return {
            advice: false,
            message: 'missing parameters',
        };
    }

    const changeInCoinUntilNow = marketCoin - openingPrice;
    const changePercent = parseFloat(
        Number(changeInCoinUntilNow / marketCoin * 100).toFixed(3)
    );

    const percentageDropWatch = -5;

    // price has increased X percent
    if (changePercent > 0) {
        return {
            advice: false,
            message: `${coin} market too high to buy.`,
        };
    }

    // price has decreased 5 percent or more
    if (changePercent <= percentageDropWatch) {
        const percentageDropped = Math.abs(changePercent);
        const message = `${coin} has dropped ${percentageDropped}%. Purchase advisable.`;

        if (!process.env.TESTING && twilioActivated) {
            notifyUserViaText(message);
        }

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

module.exports = {
    advisePurchase,
};
