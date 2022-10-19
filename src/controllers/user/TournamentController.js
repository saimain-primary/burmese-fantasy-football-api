const TournamentService = require("../../services/TournamentService");

module.exports.index = async (req, res) => {
  let response = {};
  try {
    await TournamentService.getIndex(req)
      .then((result) => {
        response.code = 200;
        response.message = "Tournament Page Data";
        response.developer_message = "Getting tournament page data";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message = "Something went wrong in tournament data";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in tournament data";
    response.results = {};
    return res.status(200).json(response);
  }
};
