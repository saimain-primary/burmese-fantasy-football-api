const HomeService = require("../../services/HomeService");

module.exports.index = async (req, res) => {
  let response = {};
  try {
    await HomeService.getIndex(req)
      .then((result) => {
        response.code = 200;
        response.message = "Successfully get home page data";
        response.developer_message = "";
        response.results = result;
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message =
          "Something went wrong in getting home page data";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message =
      "Something went wrong in getting home page data";
    response.results = {};
    return res.status(200).json(response);
  }
};
