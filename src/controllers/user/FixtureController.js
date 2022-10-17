const FixtureService = require("../../services/FixtureService");
module.exports.getFixtureList = async (req, res) => {
  let response = {};
  try {
    await FixtureService.getList(req.query)
      .then((result) => {
        response.code = 200;
        response.message = "Fixture List";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message =
          "Something went wrong in getting fixture list";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in fixture list";
    response.results = {};
    return res.status(200).json(response);
  }
};

module.exports.getVenuesDetail = async (req, res) => {
  let response = {};
  try {
    await FixtureService.getVenuesList(req.query)
      .then((result) => {
        response.code = 200;
        response.message = "Venues List";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message =
          "Something went wrong in getting venues list";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in venues list";
    response.results = {};
    return res.status(200).json(response);
  }
};
