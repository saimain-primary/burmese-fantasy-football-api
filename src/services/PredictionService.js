const AuthService = require("../services/user/AuthService");
const PredictionModel = require("../models/Prediction");
const { default: mongoose } = require("mongoose");
const FixtureService = require("../services/FixtureService");
module.exports.predict = async (req) => {
  const userId = AuthService.getUserIDByToken(req);
  const data = req.body;

  const query = {
    fixture_id: data.fixture_id,
    user_id: mongoose.Types.ObjectId(userId),
  };

  const update = {
    home: data.home,
    week: data.week,
    away: data.away,
    boosted: data.boosted,
    home_team: data.home_team,
    away_team: data.away_team,
    user_id: mongoose.Types.ObjectId(userId),
  };

  const options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  };

  return new Promise(function (resolve, reject) {
    // check 2x boost exist
    console.log(data);
    if (data.boosted) {
      PredictionModel.findOne({
        week: data.week,
        user_id: mongoose.Types.ObjectId(userId),
        boosted: true,
      }).exec(function (err, doc) {
        if (err) {
          reject(err);
        }
        if (doc) {
          console.log(doc);
          if (doc.fixture_id != data.fixture_id) {
            reject({
              message: `You have already used 2x booster in
              ${doc.home_team.name} vs ${doc.away_team.name} match for Game Week ${doc.week}. You can update your prediction and try again.`,
            });
          } else {
            PredictionModel.findOneAndUpdate(query, update, options).exec(
              function (err, result) {
                if (err) {
                  reject(err);
                }
                resolve(result);
              }
            );
          }
        } else {
          PredictionModel.findOneAndUpdate(query, update, options).exec(
            function (err, result) {
              if (err) {
                reject(err);
              }

              resolve(result);
            }
          );
        }
      });
    } else {
      PredictionModel.findOneAndUpdate(query, update, options).exec(function (
        err,
        result
      ) {
        if (err) {
          reject(err);
        }

        resolve(result);
      });
    }
  });
};

module.exports.getList = async (req) => {
  const userId = AuthService.getUserIDByToken(req);

  console.log("userId", userId);
  let filter = {};
  if (req.query.fixture_id) {
    filter = {
      user_id: mongoose.Types.ObjectId(userId),
      fixture_id: req.query.fixture_id,
    };
  } else if (req.query.fixture_week) {
    filter = {
      user_id: mongoose.Types.ObjectId(userId),
      week: req.query.fixture_week,
    };
  }

  return new Promise(function (resolve, reject) {
    PredictionModel.find(filter)
      .then((result) => {
        resolve(result);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

module.exports.calculatePoint = async (req) => {
  let filter = {};
  let predictions = null;
  if (req.body.prediction_id) {
    filter = req.body.prediction_id;
    if (Array.isArray(filter)) {
      filter = { _id: { $in: req.body.prediction_id } };
    } else {
      filter = { _id: mongoose.Types.ObjectId(filter) };
    }
  } else if (req.body.week && req.body.user_id) {
    filter = {
      user_id: mongoose.Types.ObjectId(req.body.user_id),
      week: req.body.week,
    };
  }

  console.log("filter", filter);
  predictions = await PredictionModel.find(filter);

  let fixtures_id = [];
  predictions.forEach((prediction) => {
    fixtures_id.push(prediction.fixture_id);
  });

  const fixtures = await FixtureService.getList({ fixture_ids: fixtures_id });

  let predictionResultList = [];

  fixtures.forEach((fixture) => {
    const getFixturePredictionObj = predictions.filter((p) => {
      return p.fixture_id == fixture.fixture.id.toString();
    });

    console.log("fff", fixture);

    let singlePredictionResult = {
      _id: getFixturePredictionObj[0]._id,
      home_team: getFixturePredictionObj[0].home_team,
      away_team: getFixturePredictionObj[0].away_team,
      user_id: getFixturePredictionObj[0].user_id,
      fixture_id: fixture.fixture.id,
      week: getFixturePredictionObj[0].week,
      predicts: {
        home: getFixturePredictionObj[0].home,
        away: getFixturePredictionObj[0].away,
        boosted: getFixturePredictionObj[0].boosted,
      },
      results: {
        home: fixture.goals.home ? fixture.goals.home.toString() : 0,
        away: fixture.goals.away ? fixture.goals.away.toString() : 0,
      },
      points: {
        win_lose_draw: 0,
        goal_different: 0,
        home_team: 0,
        away_team: 0,
        total: 0,
        boosted_total: 0,
      },
    };

    if (fixture.fixture.status.short === "FT") {
      const fixtureHomeTeamResult = fixture.goals.home.toString();
      const fixtureAwayTeamResult = fixture.goals.away.toString();
      const predictHomeTeam = getFixturePredictionObj[0].home;
      const predictAwayTeam = getFixturePredictionObj[0].away;
      const isPredictionBoosted = getFixturePredictionObj[0].boosted;

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
      singlePredictionResult.points.boosted_total = sum;

      if (isPredictionBoosted === true) {
        singlePredictionResult.points.boosted_total =
          singlePredictionResult.points.boosted_total * 2;
      }

      predictionResultList.push(singlePredictionResult);
    }
  });

  return new Promise(function (resolve, reject) {
    try {
      resolve(predictionResultList);
    } catch (error) {
      reject(error);
    }
  });
};
