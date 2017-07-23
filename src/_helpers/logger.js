// @flow

const log = console.log;
const chalk = require("chalk");

type Log = {
  form?: "error" | "log" | "notice" | "notice-positive" | "notice-negative",
  message: any
};

module.exports = ({ form, message }: Log) => {
  switch (form) {
    case "error":
      logError({ message });
      break;
    case "notice":
      logNotice({ message });
      break;
    case "notice-positive":
      logPositiveNotice({ message });
      break;
    case "notice-negative":
      logNegativeNoticie({ message });
      break;
    default:
      logNormal({ message });
      break;
  }
};

function logNotice({ message }) {
  log(chalk.bgWhite.green(message));
}

function logPositiveNotice({ message }) {
  log(chalk.bgWhite.cyan(message));
}

function logNegativeNoticie({ message }) {
  log(chalk.bgWhite.magenta(message));
}

function logError({ message }) {
  log(chalk.bgYellow.black(message));
}

function logNormal({ message }) {
  log(chalk.inverse(message));
}
