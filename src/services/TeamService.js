const axios = require("axios");
const config = require("../config");

module.exports.getPremierLeagueTeamList = async (params) => {
  let reqParams = {};
  if (params.team_id) {
    reqParams = {
      id: params.team_id,
    };
  } else {
    reqParams = {
      league: config.PREMIER_LEAGUE_ID,
      season: config.PREMIER_LEAGUE_SEASON,
    };
  }
  return new Promise(function (resolve, reject) {
    axios
      .get("/teams", {
        params: reqParams,
      })
      .then(function (response) {
        resolve(response.data.response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

module.exports.getTeamListCustom = async (params) => {
  return new Promise(function (resolve, reject) {
    let reqParams = {};
    if (params.leaderboard) {
      reqParams = {
        league: "39",
        season: config.CURRENT_SEASON,
      };
    } else {
      reqParams = {
        league: params.league_id ?? "39",
        season: config.CURRENT_SEASON,
      };
    }

    if (params.team_id) {
      reqParams = {
        ...reqParams,
        id: params.team_id,
      };
    }

    axios
      .get("/teams", {
        params: reqParams,
      })
      .then(function (response) {
        resolve(response.data.response);
      })
      .catch(function (error) {
        console.log(error);
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
