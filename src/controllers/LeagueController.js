const LeagueService = require("../services/LeagueService");

module.exports.getList = async (req, res) => {
  let response = {};
  try {
    await LeagueService.getList(req.query)
      .then((result) => {
        response.code = 200;
        response.message = "League List";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message = "Something went wrong in fetching league";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in fetching leagues";
    response.results = {};
    return res.status(200).json(response);
  }
};

module.exports.getDetail = async (req, res) => {
  let response = {};
  try {
    await LeagueService.getDetail(req.params.id)
      .then((result) => {
        response.code = 200;
        response.message = "League Detail";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message = "Something went wrong in fetching league";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in fetching leagues";
    response.results = {};
    return res.status(200).json(response);
  }
}
