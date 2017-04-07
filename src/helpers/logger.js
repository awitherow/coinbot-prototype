const log = console.log;
const chalk = require('chalk');

module.exports = ({ type, title, info }) =>
    type === 'error' ? logError({ title, info }) : logNormal({ title, info });

function logError({ title, info }) {
    log(chalk.bgYellow.black(`${title}: ${info}`));
}

function logNormal({ title, info }) {
    log(chalk.inverse(`${title}: ${info}`));
}
