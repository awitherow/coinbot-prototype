const { roundTo } = require('./math');

describe('roundTo', () => {
    it('should round a number to the number plus x length in decimals', () => {
        expect(roundTo(5.032363239, 5)).toBe(5.03236);
    });
});
