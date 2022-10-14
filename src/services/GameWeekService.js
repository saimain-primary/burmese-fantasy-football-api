const GameWeekDoc = require("../models/GameWeek");

module.exports.getGameWeek = async (params) => {
  return new Promise(function (resolve, reject) {
    GameWeekDoc.find()
      .sort({
        week: 1,
      })
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

module.exports.saveGameWeek = async (params) => {
  let saveData = {
    name: "Game Week " + params.gameWeek,
    week: params.gameWeek,
    startDate: params.startDate.split("-").reverse().join("-"),
    endDate: params.endDate.split("-").reverse().join("-"),
    isCurrent: params.isCurrent,
  };

  return new Promise(function (resolve, reject) {
    GameWeekDoc.create(saveData)
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};
