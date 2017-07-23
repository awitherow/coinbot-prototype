const jsonfile = require("jsonfile");
require("dotenv").config();

var path = require("path");
var appDir = path.dirname(require.main.filename);

module.exports = (id, payload) => {
  if (!process.env.TESTING) {
    const fileName = `${appDir}/db/coinData/${payload.coinCurrency}.json`;
    let data = jsonfile.readFileSync(fileName);
    if (!data) {
      data = [];
    }
    data.push(payload);
    jsonfile.writeFileSync(fileName, data);
  }
};
