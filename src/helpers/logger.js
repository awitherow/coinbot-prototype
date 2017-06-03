// @flow

const log = console.log;
const chalk = require('chalk');

type Log = {
    form?: 'error' | 'log' | 'notice',
    message: any,
};

module.exports = ({ form, message }: Log) => {
    switch (form) {
        case 'error':
            logError({ message });
            break;
        case 'notice':
            logNotice({ message });
            break;
        default:
            logNormal({ message });
            break;
    }
};

function logNotice({ message }) {
    log(chalk.bgWhite.green(message));
}

function logError({ message }) {
    log(chalk.bgYellow.black(message));
}

function logNormal({ message }) {
    log(chalk.inverse(message));
}
