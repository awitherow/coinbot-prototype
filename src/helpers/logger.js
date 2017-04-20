// @flow

const log = console.log;
const chalk = require('chalk');

type Log = {
    form?: 'error' | 'log',
    title: string,
    info: any,
};

module.exports = ({ form, title, info }: Log) =>
    (form === 'error' ? logError({ title, info }) : logNormal({ title, info }));

function logError({ title, info }) {
    log(chalk.bgYellow.black(`${title}: ${info}`));
}

function logNormal({ title, info }) {
    log(chalk.inverse(`${title}: ${info}`));
}
