const axios = require("axios");
const config = require("../config");
const LeagueDoc = require('../models/League');
const GameWeekDoc = require('../models/GameWeek');
module.exports.getList = async (params) => {
  return new Promise(function (resolve, reject) {
    LeagueDoc.find()
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

module.exports.getDetail = async (league_id) => {

  return new Promise(function (resolve, reject) {
    if (league_id === 39) {
      GameWeekDoc.find({
        league : null
      })
        .then(function (response) {
          resolve(response);
        })
        .catch(function (error) {
          reject(error);
        });
    } else {
      GameWeekDoc.find({
        league : league_id
      })
        .then(function (response) {
          resolve(response);
        })
        .catch(function (error) {
          reject(error);
        });
    }
  });
}