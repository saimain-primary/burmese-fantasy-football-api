const GameWeekService = require("../../services/GameWeekService");

module.exports.currentGameWeek = async (req, res) => {
  let response = {};
  try {
    await GameWeekService.getGameWeek({ is_current: true })
      .then((result) => {
        response.code = 200;
        response.message = "Current Game Week";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message =
          "Something went wrong in getting current game week";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in game week current";
    response.results = {};
    return res.status(200).json(response);
  }
};

module.exports.homeGameWeek = async (req, res) => {
  let response = {};
  try {
    await GameWeekService.getGameWeek({ is_home_page: true })
      .then((result) => {
        response.code = 200;
        response.message = "Current Game Week";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message =
          "Something went wrong in getting current game week";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in game week current";
    response.results = {};
    return res.status(200).json(response);
  }
};
module.exports.addGameWeek = async (req, res) => {
  let response = {};
  try {
    await GameWeekService.saveGameWeek(req.body)
      .then((result) => {
        response.code = 200;
        response.message = "Successfully saved";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message = "Something went wrong in saving game week";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in game week saving";
    response.results = {};
    return res.status(200).json(response);
  }
};

module.exports.getGameWeek = async (req, res) => {
  let response = {};
  try {
    await GameWeekService.getGameWeek(req.query)
      .then((result) => {
        response.code = 200;
        response.message = "Game Week List";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message =
          "Something went wrong in getting game week";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in game week getting";
    response.results = {};
    return res.status(200).json(response);
  }
};

module.exports.changeCurrentGameWeek = async (req, res) => {
  let response = {};
  try {
    await GameWeekService.changeCurrentGameWeek(req.body)
      .then((result) => {
        response.code = 200;
        response.message = "Successfully changed";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message =
          "Something went wrong in changing current game week";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message =
      "Something went wrong in game week current changing";
    response.results = {};
    return res.status(200).json(response);
  }
};

module.exports.changeHomeGameWeek = async (req, res) => {
  let response = {};
  try {
    await GameWeekService.changeHomeGameWeek(req.body)
      .then((result) => {
        response.code = 200;
        response.message = "Successfully changed";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message =
          "Something went wrong in changing home game week";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message =
      "Something went wrong in game week home changing";
    response.results = {};
    return res.status(200).json(response);
  }
};