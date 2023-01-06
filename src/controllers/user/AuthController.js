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
                response.developer_message =
                    "Something went wrong in saving user";
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
        await AuthService.verifyOTP({ ...req.body, expire_at: new Date() })
            .then(async (result) => {
                const loginData = await AuthService.authenticate({
                    phone: req.body.phone,
                    password: req.body.password,
                });
                response.code = 200;
                response.flag = "verify_success";
                response.message = "Successfully verified";
                response.developer_message =
                    "Successfully verified the user account";
                response.results = { ...result._doc, token: loginData.token };
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

module.exports.ChangePassword = async (req, res) => {
    const { phone, token, password, confirm_password } = req.body;
    let response = {};
    try {
        const changePassword = await AuthService.changePassword({
            phone,
            token,
            password,
        });
        console.log(changePassword);
        response.code = 200;
        response.flag = "change_password";
        response.message = "Successfully changed password";
        response.developer_message = "Successfully changed password";
        response.results = changePassword;
        return res.status(200).json(response);
    } catch (error) {
        response.code = 401;
        response.message = "Change Password Fail";
        response.developer_message = "Something went wrong in change password";
        response.results = error;
        return res.status(200).json(response);
    }
};

module.exports.ForgetPassword = async (req, res) => {
    const { phone } = req.body;
    let response = {};
    try {
        const forgetPassword = await AuthService.forgetPassword({
            phone,
        });
        console.log(forgetPassword);
        response.code = 200;
        response.flag = "forget_password";
        response.message = "We have send you OTP code for password reset";
        response.developer_message = "Successfully send code to phone";
        response.results = forgetPassword;
        return res.status(200).json(response);
    } catch (error) {
        response.code = 401;
        response.flag = error.flag;
        response.message = "Forget Fail";
        response.developer_message = "Something went wrong in forget password";
        response.results = error.message;
        return res.status(200).json(response);
    }
};

module.exports.ResetPassword = async (req, res) => {
    const { phone, code } = req.body;
    let response = {};
    try {
        const resetPassword = await AuthService.resetPassword({
            phone,
            code,
        });
        console.log("rr", resetPassword);
        response.code = 200;
        response.flag = "forget_password";
        response.message = "We have send you OTP code for password reset";
        response.developer_message = "Successfully send code to phone";
        response.results = resetPassword;
        return res.status(200).json(response);
    } catch (error) {
        response.code = 401;
        response.message = "Forget Fail";
        response.developer_message = "Something went wrong in forget password";
        response.results = error;
        return res.status(200).json(response);
    }
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

module.exports.updateAccount = async (req, res) => {
    let response = {};
    try {
        await UserService.updateUser(req.body)
            .then((result) => {
                response.code = 200;
                response.message = "Successfully updated";
                response.developer_message = "";
                response.results = result;
            })
            .catch((e) => {
                response.code = 401;
                response.message = e.message;
                response.developer_message =
                    "Something went wrong in updating user";
                response.results = e;
            });
        return res.status(200).json(response);
    } catch (error) {
        response.code = 401;
        response.message = error;
        response.developer_message = "Something went wrong in user updating";
        response.results = {};
        return res.status(200).json(response);
    }
};

module.exports.updateProfileImage = async (req, res) => {
    let response = {};
    try {
        await UserService.updateProfileImage(req)
            .then((result) => {
                response.code = 200;
                response.message = "Successfully updated";
                response.developer_message = "";
                response.results = result;
            })
            .catch((e) => {
                response.code = 401;
                response.message = e.message;
                response.developer_message =
                    "Something went wrong in updating user";
                response.results = e;
            });
        return res.status(200).json(response);
    } catch (error) {
        response.code = 401;
        response.message = error;
        response.developer_message = "Something went wrong in user updating";
        response.results = {};
        return res.status(200).json(response);
    }
};
