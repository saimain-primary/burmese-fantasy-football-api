const FixtureService = require("../services/FixtureService");
const TeamService = require("../services/TeamService");
const AuthService = require("../services/user/AuthService");
const PredictionService = require("../services/PredictionService");

module.exports.getIndex = async (req) => {
  const query = req.query;
  const body = req.body;

  // query => venue_id , fixture_id , fixture_from , fixture_to , team_id , get

  const get = query.get.split(",");

  return new Promise(async function (resolve, reject) {
    console.log("working on api");

    let response = {};

    try {
      if (get.includes("fixtures")) {
        const fixtures = await FixtureService.getList(query);
        response = { ...response, fixtures };
      }

      if (get.includes("teams")) {
        const teams = await TeamService.getPremierLeagueTeamList(query);
        response = { ...response, teams };
      }

      if (get.includes("venues")) {
        const venues = await FixtureService.getVenuesList(query);
        response = { ...response, venues };
      }

      if (get.includes("predictions")) {
        const predictions = await PredictionService.getList(req);
        response = { ...response, predictions };
      }

      resolve(response);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};


module.exports.getIndexCustom = async (req) => {
  const query = req.query;
  const body = req.body;

  // query => venue_id , fixture_id , fixture_from , fixture_to , team_id , get

  const get = query.get.split(",");

  return new Promise(async function (resolve, reject) {
    console.log("working on api");

    let response = {};

    try {
      if (get.includes("fixtures")) {
        const fixtures = await FixtureService.getListCustom(query);
        response = { ...response, fixtures };
      }

      if (get.includes("teams")) {
        const teams = await TeamService.getTeamListCustom(query);
        response = { ...response, teams };
      }

      if (get.includes("venues")) {
        const venues = await FixtureService.getVenuesList(query);
        response = { ...response, venues };
      }

      if (get.includes("predictions")) {
        const predictions = await PredictionService.getListCustom(req);
        response = { ...response, predictions };
      }

      resolve(response);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
