const jsonfile = require("jsonfile");

module.exports = (id, payload) => {
  const file = jsonfile.readFileSync("src/db/coinData/data.json");
  writeFileSync(payload);
};
