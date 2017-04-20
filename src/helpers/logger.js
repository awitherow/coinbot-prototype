// @flow

const log = console.log;
const chalk = require('chalk');

type Log = {
    form?: 'error' | 'log' | 'notice',
    title: string,
    info: any,
};

module.exports = ({ form, title, info }: Log) => {
    switch (form) {
        case 'error':
            logError({ title, info });
            break;
        case 'notice':
            logNotice({ title, info });
            break;
        default:
            logNormal({ title, info });
            break;
    }
};

function logNotice({ title, info }) {
    log(chalk.bgWhite.green(`${title}: ${info}`));
}

function logError({ title, info }) {
    log(chalk.bgYellow.black(`${title}: ${info}`));
}

function logNormal({ title, info }) {
    log(chalk.inverse(`${title}: ${info}`));
}
