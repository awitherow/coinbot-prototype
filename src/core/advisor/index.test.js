const { shouldPurchase } = require('./');

describe('shouldPurchase', () => {
    const coin = 'LTC';

    it('should not accept missing parameters', () => {
        expect(shouldPurchase()).toEqual({
            advice: false,
            message: 'missing parameters',
        });
    });

    it('should not advise purchase when price change percentage is on increase', () => {
        const marketCoin = 21;
        const openingPrice = 20;
        expect(shouldPurchase(coin, marketCoin, openingPrice)).toEqual({
            advice: false,
            message: 'LTC market too high to buy.',
        });
    });

    it('should advise purchase when price change percentage has dropped significantly', () => {
        const marketCoin = 15;
        const openingPrice = 20;
        expect(shouldPurchase(coin, marketCoin, openingPrice)).toEqual({
            advice: true,
            message: `${coin} has dropped 33.333%. Purchase advisable.`,
        });
    });

    it('should not advise purchase when price change percentage is insignificant', () => {
        const marketCoin = 19.9;
        const openingPrice = 20;
        expect(shouldPurchase(coin, marketCoin, openingPrice)).toEqual({
            advice: false,
            message: 'LTC market dropped -0.503%, not yet significant.',
        });
    });
});
