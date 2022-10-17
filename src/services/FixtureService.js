const axios = require("axios");
const config = require("../config");
module.exports.getList = async (params) => {
  return new Promise(function (resolve, reject) {
    axios
      .get("/fixtures", {
        params: {
          league: config.PREMIER_LEAGUE_ID,
          season: config.PREMIER_LEAGUE_SEASON,
          timezone: config.TIMEZONE,
          from: params.from,
          to: params.to,
        },
      })
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};
