const PlayerService = require('../../services/PlayerService');
module.exports.getPlayerStatistics = async (req, res) => {
  let response = {};
  try {
    await PlayerService.getPlayerStatistic(req.query)
      .then((result) => {
        response.code = 200;
        response.message = "Player Statistics";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message =
          "Something went wrong in getting player statistics";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in player statistics";
    response.results = {};
    return res.status(200).json(response);
  }
};
