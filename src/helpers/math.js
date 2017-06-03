//@flow

function roundTo(x: number, to: number): number {
    return parseFloat(Number(x).toFixed(to));
}

function stdNum(x: number): number {
    return roundTo(x, 5);
}

module.exports = {
    roundTo,
    stdNum,
};
