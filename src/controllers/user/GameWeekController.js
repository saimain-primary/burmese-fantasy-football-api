const GameWeekService = require("../../services/GameWeekService");

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
    await GameWeekService.getGameWeek()
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
