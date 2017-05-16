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

    test('expect prepareLastOrder to be a function', () => {
        expect(prepareLastOrder(matches)).toBe({});
    });
});
