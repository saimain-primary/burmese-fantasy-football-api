const { default: mongoose } = require("mongoose");
const { compareBoostedTotalPoint } = require("../helpers/sort");
const FixtureService = require("./FixtureService");
const PredictionService = require("./PredictionService");

module.exports.getList = async (req) => {
  const predictions = await PredictionService.getList(req);
  const fixture_ids = [];

  console.log("predictions", predictions);
  predictions.forEach(async (prediction) => {
    fixture_ids.push(prediction.fixture_id);
  });

  const fixtureList = await FixtureService.getList({
    fixture_ids: fixture_ids,
  });

  let predictionResultList = [];

  predictions.forEach(async (prediction) => {
    let fixtureObj = fixtureList.filter((f) => {
      return f.fixture.id === parseInt(prediction.fixture_id);
    });

    let singlePredictionResult = {
      _id: prediction._id,
      user: prediction.user,
      home_team: prediction.home_team,
      away_team: prediction.away_team,
      user_id: prediction.user_id,
      fixture_id: prediction.fixture_id,
      week: prediction.week,
      predicts: {
        home: prediction.home,
        away: prediction.away,
        boosted: prediction.boosted,
      },
      results: {
        home: fixtureObj[0].goals.home
          ? fixtureObj[0].goals.home.toString()
          : 0,
        away: fixtureObj[0].goals.away
          ? fixtureObj[0].goals.away.toString()
          : 0,
      },
      points: {
        win_lose_draw: 0,
        goal_different: 0,
        home_team: 0,
        away_team: 0,
        total: 0,
      },
    };

    if (fixtureObj[0].fixture.status.short === "FT") {
      const fixtureHomeTeamResult = fixtureObj[0].goals.home.toString();
      const fixtureAwayTeamResult = fixtureObj[0].goals.away.toString();
      const predictHomeTeam = prediction.home;
      const predictAwayTeam = prediction.away;
      const isPredictionBoosted = prediction.boosted;

      let win_lose_draw_result = "";
      let win_lose_draw_predict = "";
      let goal_different_result =
        parseInt(fixtureHomeTeamResult) - parseInt(fixtureAwayTeamResult);
      let goal_different_predict =
        parseInt(predictHomeTeam) - parseInt(predictAwayTeam);

      if (parseInt(predictHomeTeam) === parseInt(predictAwayTeam)) {
        win_lose_draw_predict = "draw";
      } else if (parseInt(predictHomeTeam) > parseInt(predictAwayTeam)) {
        win_lose_draw_predict = "home_team_win";
      } else if (parseInt(predictHomeTeam) < parseInt(predictAwayTeam)) {
        win_lose_draw_predict = "away_team_win";
      }

      if (parseInt(fixtureHomeTeamResult) === parseInt(fixtureAwayTeamResult)) {
        win_lose_draw_result = "draw";
      } else if (
        parseInt(fixtureHomeTeamResult) > parseInt(fixtureAwayTeamResult)
      ) {
        win_lose_draw_result = "home_team_win";
      } else if (
        parseInt(fixtureHomeTeamResult) < parseInt(fixtureAwayTeamResult)
      ) {
        win_lose_draw_result = "away_team_win";
      }

      if (win_lose_draw_predict === win_lose_draw_result) {
        singlePredictionResult.points.win_lose_draw = 3;
      }

      if (goal_different_predict === goal_different_result) {
        singlePredictionResult.points.goal_different = 1;
      }

      if (parseInt(predictHomeTeam) === parseInt(fixtureHomeTeamResult)) {
        singlePredictionResult.points.home_team = 1;
      }

      if (parseInt(predictAwayTeam) === parseInt(fixtureAwayTeamResult)) {
        singlePredictionResult.points.away_team = 1;
      }

      const values = Object.values(singlePredictionResult.points);

      const sum = values.reduce((accumulator, value) => {
        return accumulator + value;
      }, 0);

      singlePredictionResult.points.total = sum;

      if (isPredictionBoosted === true) {
        singlePredictionResult.points.boosted_total = sum;
        singlePredictionResult.points.boosted_total =
          singlePredictionResult.points.boosted_total * 2;
      } else {
        singlePredictionResult.points.boosted_total = sum;
      }

      predictionResultList.push(singlePredictionResult);
    }
  });

  return new Promise(function (resolve, reject) {
    try {
      resolve(predictionResultList.sort(compareBoostedTotalPoint));
    } catch (error) {
      console.log("error", error);
      reject(error);
    }
  });
};
