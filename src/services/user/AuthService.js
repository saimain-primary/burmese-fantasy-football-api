const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const TOKEN_EXPIRE_AT = process.env.JWT_EXPIRES_IN;
const UserService = require("../../services/user/UserService");
const passwordHelper = require("../../helpers/password");
const OTPModel = require("../../models/OTP");
const generateOTP = require("../../helpers/generateOTP");
const ForgetPasswordOTPModel = require("../../models/ForgetPasswordOTP");
const { sendSMS } = require("../../helpers/sendSMS");
const PasswordResetToken = require("../../models/PasswordResetToken");
const crypto = require("crypto");
const User = require("../../models/User");

const generateToken = (data) => {
    try {
        return jwt.sign(data, TOKEN_SECRET, {
            expiresIn: TOKEN_EXPIRE_AT,
        });
    } catch (e) {
        return e;
    }
};

const verifyCode = async (data) => {
    console.log("d", data);

    let doc = await OTPModel.findOneAndUpdate(
        {
            phone: data.phone,
            code: data.code,
            expireAt: {
                $gt: new Date(),
            },
            isUsed: false,
        },
        { isUsed: true },
        {
            new: true,
        }
    );
    console.log(doc);

    if (doc) {
        return doc;
    } else {
        return null;
    }
};

const verifyResetOTP = async (data) => {
    let doc = await ForgetPasswordOTPModel.findOneAndUpdate(
        {
            phone: data.phone,
            code: data.code,
            expired_at: {
                $gt: new Date(),
            },
            is_used: false,
        },
        { is_used: true },
        {
            new: true,
        }
    );

    if (doc) {
        return doc;
    } else {
        return null;
    }
};

const decodeToken = (req) => {
    const tokenDecoded = jwt.decode(extractToken(req), {
        expiresIn: TOKEN_EXPIRE_AT,
    });
    return tokenDecoded;
};

const extractToken = (req) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        return req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
};

module.exports.checkAuth = (req) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        return req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
};

module.exports.getUserIDByToken = (req) => {
    try {
        const data = decodeToken(req);
        return data.id;
    } catch (e) {
        return null;
    }
};

module.exports.authenticate = async (data) => {
    let { phone, password } = data;
    return new Promise(function (resolve, reject) {
        UserService.getOne({ phone: phone })
            .then((result) => {
                if (result) {
                    if (result.isBanned === true) {
                        reject("You account has been banned");
                    }
                    if (result.isVerified === true) {
                        if (
                            passwordHelper.ComparePassword(
                                password,
                                result.password
                            )
                        ) {
                            let userJWT = {
                                phone: phone,
                                name: result.name,
                                id: result._id,
                                isAdmin: result.isAdmin,
                            };
                            const jwtToken = generateToken(userJWT);
                            resolve({
                                token: jwtToken,
                                user: result,
                            });
                        } else {
                            reject("Phone number or password is incorrect");
                        }
                    } else {
                        reject("You account is not verified");
                    }
                } else {
                    reject("Your phone number do not have and account");
                }
            })
            .catch((e) => {
                reject(e);
            });
    });
};

module.exports.verifyOTP = async (data) => {
    return new Promise(function (resolve, reject) {
        verifyCode(data)
            .then(async (result) => {
                console.log("ra", result);
                if (result) {
                    const verify = await UserService.updateUserVerify({
                        phone: data.phone,
                    });
                    resolve(verify);
                } else {
                    reject("OTP code not valid");
                }
            })
            .catch((e) => {
                reject(e);
            });
    });
};

module.exports.authenticateAdmin = async (data) => {
    let { phone, password } = data;
    return new Promise(function (resolve, reject) {
        UserService.getOne({ phone: phone })
            .then((result) => {
                if (result) {
                    if (result.isAdmin === true) {
                        if (
                            passwordHelper.ComparePassword(
                                password,
                                result.password
                            )
                        ) {
                            let userJWT = {
                                phone: phone,
                                name: result.name,
                                id: result._id,
                                isAdmin: result.isAdmin,
                            };
                            const jwtToken = generateToken(userJWT);
                            resolve({
                                token: jwtToken,
                                user: result,
                            });
                        } else {
                            reject("Phone number or password is incorrect");
                        }
                    } else {
                        reject("You are not admin");
                    }
                } else {
                    reject("Your phone number do not have and account");
                }
            })
            .catch((e) => {
                reject(e);
            });
    });
};

module.exports.forgetPassword = async (data) => {
    let { phone } = data;

    return new Promise(async (resolve, reject) => {
        let user = await User.findOne({ phone: phone });
        if (!user) {
            reject({
                flag: "no_account",
                message: "No user account",
            });
        } else {
            let existOTP = await ForgetPasswordOTPModel.findOne({
                phone: phone,
                is_used: false,
                expired_at: {
                    $gt: new Date(),
                },
            });

            if (existOTP) {
                reject({
                    flag: "already_send",
                    message: "You already have request the reset code",
                });
            } else {
                // let code = generateOTP.getCode();
                let code = "111111";
                let currentDate = new Date();

                let otpSaved = await ForgetPasswordOTPModel.create({
                    phone: phone,
                    code: code,
                    expired_at: currentDate.setMinutes(
                        currentDate.getMinutes() + 3
                    ),
                });

                console.log("otp saved", otpSaved);
            }

            // send otp sms here

            let sendSMS = await sendSMS({
                phone: phone,
                message: `${otpSaved.code} is your BFF reset code. Your code is valid for 3 minute.`,
            });

            resolve("We have sent you the reset code");
        }
    });
};

module.exports.resetPassword = async (data) => {
    return new Promise(function (resolve, reject) {
        verifyResetOTP(data)
            .then(async (result) => {
                if (result) {
                    console.log("result", result);
                    const currentDate = new Date();

                    let tokenSave = await new PasswordResetToken({
                        token: crypto.randomBytes(32).toString("hex"),
                        phone: result.phone,
                        expired_at: currentDate.setMinutes(
                            currentDate.getMinutes() + 3
                        ),
                    }).save();

                    resolve(tokenSave);
                } else {
                    reject("OTP code not valid or expired");
                }
            })
            .catch((e) => {
                reject(e);
            });
    });
};

const verifyTokenPasswordReset = async (data) => {
    let findToken = await PasswordResetToken.findOne({
        phone: data.phone,
        token: data.token,
        expired_at: {
            $gt: new Date(),
        },
    });

    if (findToken) {
        return findToken;
    } else {
        return null;
    }
};

module.exports.changePassword = async (data) => {
    return new Promise(function (resolve, reject) {
        verifyTokenPasswordReset(data)
            .then(async (result) => {
                if (result) {
                    await PasswordResetToken.deleteOne(result._id);
                    await User.findOneAndUpdate(
                        { phone: result.phone },
                        {
                            password: passwordHelper.HashPassword(
                                data.password
                            ),
                        },
                        { new: true }
                    );
                    resolve("Password Changed");
                } else {
                    reject("OTP code not valid");
                }
            })
            .catch((e) => {
                reject(e);
            });
    });
};
