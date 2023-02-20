const { default: axios } = require("axios");
const PlayerStatisticsModel = require("../models/PlayerStatistics");

module.exports.fetchPlayerStatisticByFixture = async (fixture) => {
  return new Promise(function (resolve, reject) {
    axios
      .get("/fixtures/players", {
        params: { fixture: fixture },
      })
      .then(async function (res) {
        const { response } = res.data;
        const homeTeam = response[0];
        const awayTeam = response[1];

        if (homeTeam) {
          homeTeam.players.map(async (p) => {
            const query = {
              fixtureId: fixture,
              player: p.player,
            };

            const update = {
              team: homeTeam.team,
              fixtureId: fixture,
              player: p.player,
              statistics: p.statistics,
            };

            const options = {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
            };

            await PlayerStatisticsModel.findOneAndUpdate(
              query,
              update,
              options
            );
          });
        }

        if (awayTeam) {
        }

        resolve(res.data.response);
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });
  });
};

module.exports.getPlayerStatistic = async (params) => {
  let filter = {
    fixtureId: null,
  };

  if (params.fixture) {
    filter = {
      fixtureId: params.fixture,
    };
  } else if (params.fixtures) {
    const fixturesArray = params.fixtures.split(",");
    filter = {
      fixtureId: { $in: fixturesArray },
    };
  }

  console.log("filter ", filter);

  return new Promise(function (resolve, reject) {
    PlayerStatisticsModel.find(filter)
      .then((result) => {
        resolve(result);
      })
      .catch((e) => {
        reject(e);
      });
  });
};
