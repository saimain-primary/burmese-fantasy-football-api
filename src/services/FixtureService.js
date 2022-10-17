const axios = require("axios");
const config = require("../config");
module.exports.getList = async (params) => {
  let reqParams = {};

  if (params.id) {
    reqParams = {
      id: params.id,
    };
  } else {
    reqParams = {
      league: config.PREMIER_LEAGUE_ID,
      season: config.PREMIER_LEAGUE_SEASON,
      timezone: config.TIMEZONE,
      from: params.from,
      to: params.to,
    };
  }
  return new Promise(function (resolve, reject) {
    axios
      .get("/fixtures", {
        params: reqParams,
      })
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

module.exports.getVenuesList = async (params) => {
  let reqParams = {};

  if (params.id) {
    reqParams = {
      id: params.id,
    };
  }
  return new Promise(function (resolve, reject) {
    axios
      .get("/venues", {
        params: reqParams,
      })
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};
