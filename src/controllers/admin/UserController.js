const UserService = require('../../services/UserService');
module.exports.getList = async (req, res) => {
    let response = {};
    try {
      await UserService.getList(req)
        .then((result) => {
          response.code = 200;
          response.message = "Successfully get user list";
          response.developer_message = "";
          response.results = result;
        })
        .catch((e) => {
          response.code = 401;
          response.message = e.message;
          response.developer_message =
            "Something went wrong in getting user list";
          response.results = e;
        });
      return res.status(200).json(response);
    } catch (error) {
      response.code = 401;
      response.message = error;
      response.developer_message =
        "Something went wrong in getting user list";
      response.results = {};
      return res.status(200).json(response);
    }

}