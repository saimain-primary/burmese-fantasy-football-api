const UserService = require("../../services/user/UserService");
const AuthService = require("../../services/user/AuthService");
const { default: mongoose } = require("mongoose");

module.exports.login = async (req, res) => {
    const { phone, password } = req.body;
    let response = {};
    try {
      const loginData = await AuthService.authenticateAdmin({ phone, password });
      console.log(loginData);
      response.code = 200;
      response.flag = "login_success";
      response.message = "Successfully login";
      response.developer_message = "Successfully login to admin account";
      response.results = loginData;
      return res.status(200).json(response);
    } catch (error) {
      response.code = 401;
      response.message = error;
      response.developer_message = "Something went wrong in user login";
      response.results = error;
      return res.status(200).json(response);
    }
}

module.exports.me = async (req, res) => {
  let response = {};
  try {
    const checkData = await UserService.getOne({
      _id: mongoose.Types.ObjectId(AuthService.getUserIDByToken(req)),
    });
    console.log(checkData);
    response.code = 200;
    response.message = "Authorized";
    response.developer_message = "User account detail by access token";
    response.results = checkData;
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    response.code = 401;
    response.message = "Login Failed";
    response.developer_message = "Something went wrong in user login";
    response.results = error;
    return res.status(200).json(response);
  }
}