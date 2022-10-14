const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const TOKEN_EXPIRE_AT = process.env.JWT_EXPIRES_IN;
const UserService = require("../../services/user/UserService");
const passwordHelper = require("../../helpers/password");
const OTPModel = require("../../models/OTP");

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

module.exports.getUserIDByToken = (req) => {
  try {
    const data = decodeToken(req);
    return data.id;
  } catch (e) {
    console.log(e);
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
            if (passwordHelper.ComparePassword(password, result.password)) {
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
