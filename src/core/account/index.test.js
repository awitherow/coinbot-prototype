const { prepareLastOrder } = require('./');

describe('prepareLastOrder', () => {
    const matches = [
        {
            amount: '100',
            details: {
                order_id: 'order1',
                product_id: 'LTC-USD',
            },
        },
        {
            amount: '150',
            details: {
                order_id: 'order1',
                product_id: 'LTC-USD',
            },
        },
        {
            amount: '150',
            details: {
                order_id: 'order2',
                product_id: 'LTC-USD',
            },
        },
        {
            amount: '150',
            details: {
                order_id: 'order3',
                product_id: 'BTC-USD',
            },
        },
    ];

    const actual = prepareLastOrder(matches);

    test('is a function', () => {
        expect(typeof prepareLastOrder).toBe('function');
    });

    test('returns a proper orderType', () => {
        expect(actual.orderType).toBe('LTC-USD');
    });

    test('returns a string order type', () => {
        expect(actual.orderType).toBe('LTC-USD');
    });

    test('returns a string coin', () => {
        expect(actual.coin).toBe('LTC');
    });

    test('returns the latest orders matches', () => {
        expect(actual.matches).toEqual([
            {
                amount: '100',
                details: { order_id: 'order1', product_id: 'LTC-USD' },
            },
            {
                amount: '150',
                details: { order_id: 'order1', product_id: 'LTC-USD' },
            },
        ]);
    });

    test('returns the latest coin order amount', () => {
        expect(actual.amount).toEqual(250);
    });
});
