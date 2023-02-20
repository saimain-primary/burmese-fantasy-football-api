const GameWeekDoc = require("../models/GameWeek");

module.exports.getGameWeek = async (params) => {
  let where = {};


  if (params) {
    if (params.league) {
      let data = {
        league: params.league
      };
      where = { ...where, ...data };
    }

    if (params.is_current && params.is_current === true) {
      let data = {
        isCurrent: true,
      };
      where = { ...where, ...data };
    }
    if (params.is_home_page && params.is_home_page === true) {
      let data = {
        isHomePageCurrent: true,
      };
      where = { ...where, ...data };
    }
  }


  return new Promise(function (resolve, reject) {
    GameWeekDoc.find(where)
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
    league: params.league,
    name: params.gameWeek,
    week: params.gameWeek,
    startDate: params.startDate,
    endDate: params.endDate,
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

module.exports.changeCurrentGameWeek = async (params) => {
  console.log(params);
  const oldFilter = { isCurrent: true };
  const oldUpdate = { isCurrent: false };
  await GameWeekDoc.findOneAndUpdate(oldFilter, oldUpdate);

  return new Promise(function (resolve, reject) {
    const newFilter = { week: params.gameWeek };
    const newUpdate = { isCurrent: true };

    GameWeekDoc.findOneAndUpdate(newFilter, newUpdate, {
      new: true,
    })
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

module.exports.changeHomeGameWeek = async (params) => {
  console.log(params);
  const oldFilter = { isHomePageCurrent: true };
  const oldUpdate = { isHomePageCurrent: false };
  await GameWeekDoc.findOneAndUpdate(oldFilter, oldUpdate);

  return new Promise(function (resolve, reject) {
    const newFilter = { week: params.homePageGameWeek };
    const newUpdate = { isHomePageCurrent: true };

    GameWeekDoc.findOneAndUpdate(newFilter, newUpdate, {
      new: true,
    })
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};
