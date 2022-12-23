const PlayerService = require('../../services/PlayerService');

module.exports.fetchPlayerStatisticByFixture = async (req, res) => {
    let response = {};
  try {
    await PlayerService.fetchPlayerStatisticByFixture(req.body.fixture)
      .then((result) => {
        response.code = 200;
        response.message = "Fetch Player Statistics";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message =
          "Something went wrong in getting player statistics fetching";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in player statistics fetching";
    response.results = {};
    return res.status(200).json(response);
  }
}