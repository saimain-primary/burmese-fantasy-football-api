const PredictionService = require("../../services/PredictionService");

module.exports.predict = async (req, res) => {
  let response = {};
  try {
    await PredictionService.predict(req)
      .then((result) => {
        response.code = 200;
        response.message = "Successfully predict";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message = "Something went wrong in prediction";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in prediction";
    response.results = {};
    return res.status(200).json(response);
  }
};
