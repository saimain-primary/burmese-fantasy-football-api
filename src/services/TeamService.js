const axios = require("axios");
const config = require("../config");

module.exports.getPremierLeagueTeamList = async (params) => {
  return new Promise(function (resolve, reject) {
    axios
      .get("/teams", {
        params: {
          league: config.PREMIER_LEAGUE_ID,
          season: config.PREMIER_LEAGUE_SEASON,
          country: config.PREMIER_LEAGUE_COUNTRY,
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

module.exports.getTeamList = async (params) => {
  let reqParams = {};

  if (params.name) {
    reqParams.name = params.name;
  }

  if (params.id) {
    reqParams.id = params.id;
  }

  return new Promise(function (resolve, reject) {
    axios
      .get("/teams", {
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
