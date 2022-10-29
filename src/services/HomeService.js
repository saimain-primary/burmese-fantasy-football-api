const FixtureService = require("./FixtureService");
const PredictionService = require("./PredictionService");
const AuthService = require("../services/user/AuthService");

const {
  compareBoostedTotalPoint,
  compareAllSumPoint,
} = require("../helpers/sort");
const { calculateAverage } = require("../helpers/calculation");
module.exports.getIndex = async (req) => {
  // get your score by game week
  // get average score by game week
  // get highest score by game week
  // get recent 5 match that were finished
  // get game week deadline
  // get top prediction by game week

  const userId = AuthService.getUserIDByToken(req);
  const predictions = await PredictionService.getList(req);
  const fixture_ids = [];

  predictions.forEach(async (prediction) => {
    fixture_ids.push(prediction.fixture_id);
  });

  const fixtureList = await FixtureService.getList({
    fixture_week: req.query.fixture_week,
  });

  const sortedFixtureList = fixtureList.sort(
    (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)
  );

  const finished_matches = fixtureList.filter((f) => {
    return f.fixture.status.short === "FT";
  });

  const last_matches = [...sortedFixtureList].pop();

  console.log("fixture", last_matches);

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

  let your_score = null;
  if (userId) {
    your_score = leaderboardListReturn.filter((l) => {
      return l.user_id.equals(userId);
    })[0];
  }

  const lastMatchDate = new Date(last_matches.fixture.timestamp);
  const nowDate = new Date();
  return new Promise(function (resolve, reject) {
    try {
      let returnData = {
        highest_score: leaderboardListReturn.sort(compareAllSumPoint)[0],
        your_score: your_score,
        average_score: calculateAverage(leaderboardListReturn),
        recent_matches: sortedFixtureList.slice(
          finished_matches.length - 5,
          finished_matches.length
        ),
        deadline: {
          days: lastMatchDate.getDay() - nowDate.getDay(),
          hours: lastMatchDate.getHours() - nowDate.getHours(),
          mins: lastMatchDate.getMinutes() - nowDate.getMinutes(),
        },
      };
      resolve(returnData);
    } catch (error) {
      console.log("error", error);
      reject(error);
    }
  });
};
