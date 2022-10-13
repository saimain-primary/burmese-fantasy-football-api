const TeamService = require("../services/TeamService");

module.exports.getPremierLeagueTeamList = async (req, res) => {
  let response = {};
  try {
    await TeamService.getPremierLeagueTeamList(req.query)
      .then((result) => {
        response.code = 200;
        response.message = "Team List";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message = "Something went wrong in fetching teams";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in fetching teams";
    response.results = {};
    return res.status(200).json(response);
  }
};

module.exports.getTeamList = async (req, res) => {
  let response = {};
  try {
    await TeamService.getTeamList(req.query)
      .then((result) => {
        response.code = 200;
        response.message = "Team List";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message = "Something went wrong in fetching team";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in fetching teams";
    response.results = {};
    return res.status(200).json(response);
  }
};
