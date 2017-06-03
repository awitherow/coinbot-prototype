const { roundTo, stdNum } = require('./math');

describe('roundTo', () => {
    it('should round a number to the number plus x length in decimals', () => {
        expect(roundTo(5.032363239, 5)).toBe(5.03236);
    });
});

describe('stdNum', () => {
    it('should round numbers to the 3rd decimal point.', () => {
        expect(stdNum(5.032)).toBe(5.032);
    });
});
