const UserService = require("../../services/user/UserService");
const AuthService = require("../../services/user/AuthService");
const { default: mongoose } = require("mongoose");

module.exports.Register = async (req, res) => {
  let response = {};
  try {
    await UserService.saveUser(req.body)
      .then((result) => {
        response.code = 200;
        response.flag = "register_success";
        response.message = "Successfully registered";
        response.developer_message = "";
        response.results = { ...result._doc };
      })
      .catch((e) => {
        response.code = 401;
        response.message = e.message;
        response.developer_message = "Something went wrong in saving user";
        response.results = e;
      });
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = error;
    response.developer_message = "Something went wrong in user saving";
    response.results = {};
    return res.status(200).json(response);
  }
};

module.exports.VerifyOTP = async (req, res) => {
  let response = {};

  try {
    await AuthService.verifyOTP(req.body)
      .then(async (result) => {
        const loginData = await AuthService.authenticate({
          phone: req.body.phone,
          password: req.body.password,
        });
        response.code = 200;
        response.flag = "verify_success";
        response.message = "Successfully verified";
        response.developer_message = "Successfully verified the user account";
        response.results = { ...result, token: loginData.token };
        return res.status(200).json(response);
      })
      .catch((e) => {
        response.code = 401;
        response.message = e;
        response.developer_message =
          "Something went wrong in otp verification process";
        response.results = e;
        return res.status(200).json(response);
      });
  } catch (error) {
    response.code = 401;
    response.message = "Something went wrong";
    response.developer_message =
      "Something went wrong in otp verification process";
    response.results = error;
    return res.status(200).json(response);
  }
};

module.exports.Login = async (req, res) => {
  const { phone, password } = req.body;
  let response = {};
  try {
    const loginData = await AuthService.authenticate({ phone, password });
    console.log(loginData);
    response.code = 200;
    response.flag = "login_success";
    response.message = "Successfully login";
    response.developer_message = "Successfully login to user account";
    response.results = loginData;
    return res.status(200).json(response);
  } catch (error) {
    response.code = 401;
    response.message = "Login Failed";
    response.developer_message = "Something went wrong in user login";
    response.results = error;
    return res.status(200).json(response);
  }
};

module.exports.Logout = async (req, res) => {
  res.send("Logout");
};

module.exports.ForgetPassword = async (req, res) => {
  res.send("Forget Password");
};

module.exports.getMe = async (req, res) => {
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
    response.code = 401;
    response.message = "Login Failed";
    response.developer_message = "Something went wrong in user login";
    response.results = error;
    return res.status(200).json(response);
  }
};
