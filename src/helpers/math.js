//@flow

function roundTo(x: number, to: number): number {
    return parseFloat(Number(x).toFixed(to));
}

module.exports = {
    roundTo,
};
