const { default: mongoose } = require("mongoose");
const {
  compareBoostedTotalPoint,
  compareAllSumPoint,
} = require("../helpers/sort");
const FixtureService = require("./FixtureService");
const PredictionService = require("./PredictionService");
const UserService = require("./user/UserService");
module.exports.getList = async (req) => {
  const predictions = await PredictionService.getListCustom(req);

  const fixtureList = await FixtureService.getListCustom({
    fixture_week: req.query.fixture_week,
    league_id: req.query.league_id,
  });

  console.log("prediction list", predictions);
  console.log("fixture list", fixtureList);

  let predictionResultList = [];

  predictions.forEach(async (prediction) => {
    let fixtureObj = fixtureList.filter((f) => {
      return f.fixture.id === parseInt(prediction.fixture_id);
    });

    let singlePredictionResult = {
      _id: prediction._id,
      user: prediction.user,
      user_id: prediction.user_id,
      week: prediction.week,

      points: [
        {
          teams: {
            home_team: prediction.home_team,
            away_team: prediction.away_team,
          },
          fixture_id: prediction.fixture_id,
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
          win_lose_draw: 0,
          goal_different: 0,
          home_team: 0,
          away_team: 0,
          total: 0,
        },
      ],
    };

    // if (fixtureObj[0]) {
    //   if (fixtureObj[0].fixture.status.short === "FT") {
    //     const fixtureHomeTeamResult = fixtureObj[0].goals.home
    //       ? fixtureObj[0].goals.home.toString()
    //       : "0";
    //     const fixtureAwayTeamResult = fixtureObj[0].goals.home
    //       ? fixtureObj[0].goals.away.toString()
    //       : "0";
    //     const predictHomeTeam = prediction.home;
    //     const predictAwayTeam = prediction.away;
    //     const isPredictionBoosted = prediction.boosted;

    //     let win_lose_draw_result = "";
    //     let win_lose_draw_predict = "";
    //     let goal_different_result =
    //       parseInt(fixtureHomeTeamResult) - parseInt(fixtureAwayTeamResult);
    //     let goal_different_predict =
    //       parseInt(predictHomeTeam) - parseInt(predictAwayTeam);

    //     if (parseInt(predictHomeTeam) === parseInt(predictAwayTeam)) {
    //       win_lose_draw_predict = "draw";
    //     } else if (parseInt(predictHomeTeam) > parseInt(predictAwayTeam)) {
    //       win_lose_draw_predict = "home_team_win";
    //     } else if (parseInt(predictHomeTeam) < parseInt(predictAwayTeam)) {
    //       win_lose_draw_predict = "away_team_win";
    //     }

    //     if (
    //       parseInt(fixtureHomeTeamResult) === parseInt(fixtureAwayTeamResult)
    //     ) {
    //       win_lose_draw_result = "draw";
    //     } else if (
    //       parseInt(fixtureHomeTeamResult) > parseInt(fixtureAwayTeamResult)
    //     ) {
    //       win_lose_draw_result = "home_team_win";
    //     } else if (
    //       parseInt(fixtureHomeTeamResult) < parseInt(fixtureAwayTeamResult)
    //     ) {
    //       win_lose_draw_result = "away_team_win";
    //     }

    //     if (win_lose_draw_predict === win_lose_draw_result) {
    //       singlePredictionResult.points[0].win_lose_draw = 3;
    //     }

    //     if (goal_different_predict === goal_different_result) {
    //       singlePredictionResult.points[0].goal_different = 1;
    //     }

    //     if (parseInt(predictHomeTeam) === parseInt(fixtureHomeTeamResult)) {
    //       singlePredictionResult.points[0].home_team = 1;
    //     }

    //     if (parseInt(predictAwayTeam) === parseInt(fixtureAwayTeamResult)) {
    //       singlePredictionResult.points[0].away_team = 1;
    //     }

    //     const values = Object.values(singlePredictionResult.points[0]);
    //     values.splice(0, 4);
    //     const sum = values.reduce((accumulator, value) => {
    //       return accumulator + value;
    //     }, 0);

    //     singlePredictionResult.points[0].total = sum;

    //     if (isPredictionBoosted === true) {
    //       singlePredictionResult.points[0].boosted_total = sum;
    //       singlePredictionResult.points[0].boosted_total =
    //         singlePredictionResult.points[0].boosted_total * 2;
    //     } else {
    //       singlePredictionResult.points[0].boosted_total = sum;
    //     }

    //     predictionResultList.push(singlePredictionResult);
    //   }
    // }

    if (fixtureObj[0]) {
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

        if (
          parseInt(fixtureHomeTeamResult) === parseInt(fixtureAwayTeamResult)
        ) {
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
          singlePredictionResult.points[0].win_lose_draw = 3;
        }

        if (goal_different_predict === goal_different_result) {
          singlePredictionResult.points[0].goal_different = 1;
        }

        if (parseInt(predictHomeTeam) === parseInt(fixtureHomeTeamResult)) {
          singlePredictionResult.points[0].home_team = 1;
        }

        if (parseInt(predictAwayTeam) === parseInt(fixtureAwayTeamResult)) {
          singlePredictionResult.points[0].away_team = 1;
        }

        const values = Object.values(singlePredictionResult.points[0]);
        values.splice(0, 4);
        const sum = values.reduce((accumulator, value) => {
          return accumulator + value;
        }, 0);

        singlePredictionResult.points[0].total = sum;

        if (isPredictionBoosted === true) {
          singlePredictionResult.points[0].boosted_total = sum;
          singlePredictionResult.points[0].boosted_total =
            singlePredictionResult.points[0].boosted_total * 2;
        } else {
          singlePredictionResult.points[0].boosted_total = sum;
        }

        predictionResultList.push(singlePredictionResult);
      }
    }
  });

  let finalArr = [];

  predictionResultList.forEach((prediction) => {
    const findExistingIndex = finalArr.findIndex((p) => {
      if (p.user_id.equals(prediction.user_id)) {
        return true;
      }
      return false;
    });

    if (findExistingIndex !== -1) {
      finalArr[findExistingIndex].points.push(prediction.points[0]);
    } else {
      finalArr.push(prediction);
    }
  });

  let leaderboardListReturn = [];

  finalArr.forEach((fa) => {
    const leaderboardSum = Object.values(fa.points);
    const sum = leaderboardSum.reduce((accumulator, value) => {
      return accumulator + value.boosted_total;
    }, 0);

    leaderboardListReturn.push({ ...fa, sum: sum });
  });
  return new Promise(function (resolve, reject) {
    try {
      resolve(leaderboardListReturn.sort(compareAllSumPoint));
    } catch (error) {
      console.log("error", error);
      reject(error);
    }
  });
};

module.exports.getDetail = async (req) => {
  let returnData = {};
  const predictions = await PredictionService.getListByUserID(req);
  console.log("prediction lis", predictions);
  const fixtureList = await FixtureService.getListCustom({
    fixture_week: req.query.fixture_week,
    league_id: req.query.league_id,
  });

  let predictionResultList = {
    user: null,
    results: [],
  };

  if (predictions.length > 0) {
    predictionResultList.user = predictions[0].user;

    predictions.forEach(async (prediction) => {
      let fixtureObj = fixtureList.filter((f) => {
        return f.fixture.id === parseInt(prediction.fixture_id);
      });
      if (fixtureObj[0]) {
        let singlePredictionResult = {
          _id: prediction._id,
          week: prediction.week,
          teams: {
            home_team: prediction.home_team,
            away_team: prediction.away_team,
          },
          fixture: fixtureObj[0].fixture,
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
          points: [
            {
              win_lose_draw: 0,
              goal_different: 0,
              home_team: 0,
              away_team: 0,
              total: 0,
            },
          ],
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

          if (
            parseInt(fixtureHomeTeamResult) === parseInt(fixtureAwayTeamResult)
          ) {
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
            singlePredictionResult.points[0].win_lose_draw = 3;
          }

          if (goal_different_predict === goal_different_result) {
            singlePredictionResult.points[0].goal_different = 1;
          }

          if (parseInt(predictHomeTeam) === parseInt(fixtureHomeTeamResult)) {
            singlePredictionResult.points[0].home_team = 1;
          }

          if (parseInt(predictAwayTeam) === parseInt(fixtureAwayTeamResult)) {
            singlePredictionResult.points[0].away_team = 1;
          }

          const values = Object.values(singlePredictionResult.points[0]);

          console.log("values", values);
          const sum = values.reduce((accumulator, value) => {
            return accumulator + value;
          }, 0);

          singlePredictionResult.points[0].total = sum;

          if (isPredictionBoosted === true) {
            singlePredictionResult.points[0].boosted_total = sum;
            singlePredictionResult.points[0].boosted_total =
              singlePredictionResult.points[0].boosted_total * 2;
          } else {
            singlePredictionResult.points[0].boosted_total = sum;
          }

          predictionResultList.results.push(singlePredictionResult);
        }
      }
    });

    let finalArr = [];

    predictionResultList.results.forEach((prediction) => {
      finalArr.push(prediction);
    });

    let leaderboardListReturn = [];

    finalArr.forEach((fa) => {
      const leaderboardSum = Object.values(fa.points);
      const sum = leaderboardSum.reduce((accumulator, value) => {
        return accumulator + value.boosted_total;
      }, 0);

      leaderboardListReturn.push({ ...fa, sum: sum });
    });

    console.log("prediction", leaderboardListReturn);
  } else {
    const user = await UserService.getUserByID(req.params.id);
    predictionResultList.user = user;
    predictionResultList.results = null;
  }

  return new Promise(function (resolve, reject) {
    try {
      resolve(predictionResultList);
    } catch (error) {
      console.log("error", error);
      reject(error);
    }
  });
};
