const FixtureService = require("./FixtureService");
const PredictionService = require("./PredictionService");
const AuthService = require("../services/user/AuthService");
const moment = require("moment");
const {
  compareBoostedTotalPoint,
  compareAllSumPoint,
} = require("../helpers/sort");
const { calculateAverage } = require("../helpers/calculation");

function convertTZ(date, tzString) {
  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}


module.exports.getIndex = async (req) => {
  console.log("req", req.query);
  

  return new Promise(async function (resolve, reject) {
    try {
      const userId = AuthService.getUserIDByToken(req);
      const predictions = await PredictionService.getListCustom(req);
      const fixture_ids = [];

      predictions.forEach(async (prediction) => {
        fixture_ids.push(prediction.fixture_id);
      });

      const fixtureList = await FixtureService.getListCustom({
        league_id:  req.query.league_id,
        fixture_week: req.query.fixture_week,
      });

      console.log('fixture list', fixtureList);

      const nextFixtureList = await FixtureService.getListCustom({
        league_id:  req.query.league_id,
        fixture_week: req.query.current_week,
      });

      console.log('next fixture list', nextFixtureList);

      const sortedFixtureList = fixtureList.sort(
        (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)
      );

      const sortedNextFixtureList = nextFixtureList.sort(
        (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)
      );

      const unfinishedMatch = sortedNextFixtureList.filter((f) => {
        return f.fixture.status.short === "NS";
      });

      console.log("un", unfinishedMatch);

      const finished_matches = fixtureList.filter((f) => {
        return f.fixture.status.short === "FT";
      });

      const last_matches = [...unfinishedMatch][0];

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
                home: fixtureObj[0]
                  ? fixtureObj[0].goals.home.toString()
                  : 0,
                away: fixtureObj[0]
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

      let your_score = null;
      if (userId) {
        your_score = leaderboardListReturn.filter((l) => {
          return l.user_id.equals(userId);
        })[0];
      }

      const nowDate = convertTZ(new Date(), "Asia/Yangon");
      let lastDate = null;
      
      if (last_matches) {
       lastDate = convertTZ(last_matches.fixture.date,"Asia/Yangon");
      } else {
        lastDate = new Date();
      }
      
      var seconds = Math.floor((lastDate - (nowDate))/1000);
      var minutes = Math.floor(seconds/60);
      var hours = Math.floor(minutes/60);
      var days = Math.floor(hours/24);
      
      hours = hours-(days*24);
      minutes = minutes-(days*24*60)-(hours*60);
      seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);
      
      console.log('s',leaderboardListReturn.sort(compareAllSumPoint))
      let returnData = {
        highest_score: leaderboardListReturn.sort(compareAllSumPoint)[0],
        your_score: your_score,
        average_score: Math.round(calculateAverage(leaderboardListReturn)),
        recent_matches: sortedFixtureList.slice(
          finished_matches.length - 5,
          finished_matches.length
        ),
        deadline: {
          days: days > 0 ? days : 0,
          hours: hours > 0 ? hours : 0,
          mins: minutes > 0 ? minutes : 0,
        },
      };
      resolve(returnData);
    } catch (error) {
      console.log("error", error);
      reject(error);
    }
  });
};
