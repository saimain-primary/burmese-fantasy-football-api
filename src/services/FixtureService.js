const axios = require("axios");
const config = require("../config");
const GameWeekDoc = require("../models/GameWeek");
module.exports.getList = async (params) => {
  let reqParams = {};

  if (params.fixture_id) {
    reqParams = {
      id: params.fixture_id,
    };
  } else if (params.fixture_week) {
    // get start and end from week
    const weekData = await GameWeekDoc.findOne({ week: params.fixture_week });
    console.log("weekdata", weekData);
    if (weekData) {
      reqParams = {
        league: config.PREMIER_LEAGUE_ID,
        season: config.PREMIER_LEAGUE_SEASON,
        timezone: config.TIMEZONE,
        from: weekData.startDate,
        to: weekData.endDate,
      };
    }
  } else if (params.fixture_ids) {
    const ids = params.fixture_ids.join("-");
    reqParams = {
      ids: ids,
    };
  } else if (params.recent) {
    reqParams = {
      league: config.PREMIER_LEAGUE_ID,
      season: config.PREMIER_LEAGUE_SEASON,
      timezone: config.TIMEZONE,
      last: params.recent,
    };
  } else {
    reqParams = {
      league: config.PREMIER_LEAGUE_ID,
      season: config.PREMIER_LEAGUE_SEASON,
      timezone: config.TIMEZONE,
      from: params.fixture_from,
      to: params.fixture_to,
    };
  }

  console.log("req params", reqParams);

  return new Promise(function (resolve, reject) {
    axios
      .get("/fixtures", {
        params: reqParams,
      })
      .then(function (response) {
        resolve(response.data.response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

module.exports.getListCustom = async (params) => {

  console.log('log from a', params);
  let reqParams = {
    timezone: config.TIMEZONE,
    season: config.CURRENT_SEASON,
  };

  if (params.league_id) {
    reqParams = {
      ...reqParams,
      league: params.league_id,
    };
  }

  if (params.fixture_id) {
    reqParams = {
      ...reqParams,
      id: params.fixture_id,
    };
  }

  if (params.fixture_week) {
    const weekData = await GameWeekDoc.findOne({
      league: params.league_id,
      week: params.fixture_week,
    });
    console.log("weekdata", weekData);
    if (weekData) {
      reqParams = {
        ...reqParams,
        from: weekData.startDate,
        to: weekData.endDate,
      };
    } else {
      console.log('no gameweek data');
    }
  }

  if (params.fixture_ids) {
    const ids = params.fixture_ids.join("-");
    reqParams = {
      ...reqParams,
      ids: ids,
    };
  }
  
  if (params.recent) {
    reqParams = {
    ...reqParams,
      last: params.recent,
    };
  } 

  console.log("req params", reqParams);

  return new Promise(function (resolve, reject) {
    axios
      .get("/fixtures", {
        params: reqParams,
      })
      .then(function (response) {
        resolve(response.data.response);
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });
  });
};

module.exports.getVenuesList = async (params) => {
  let reqParams = {};

  if (params.venue_id) {
    reqParams = {
      id: params.venue_id,
    };
  }
  return new Promise(function (resolve, reject) {
    axios
      .get("/venues", {
        params: reqParams,
      })
      .then(function (response) {
        resolve(response.data.response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};
