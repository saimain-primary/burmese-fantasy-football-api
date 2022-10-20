const AuthService = require("../services/user/AuthService");
const PredictionModel = require("../models/Prediction");
const { default: mongoose } = require("mongoose");

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
          reject({
            message: `You have already used 2x booster in
              ${doc.home_team.name} vs ${doc.away_team.name} match for Game Week ${doc.week}. You can update your prediction and try again.`,
          });
        }
      });
    }

    PredictionModel.findOneAndUpdate(query, update, options).exec(function (
      err,
      result
    ) {
      if (err) {
        reject(err);
      }

      resolve(result);
    });
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
