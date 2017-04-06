const log = console.log;
const chalk = require('chalk');

module.exports = ({ type, title, info }) =>
    type === 'error'
        ? log(chalk.bgYellow.black(`${title}: ${info}`))
        : log(chalk.inverse(`${title}: ${info}`));
