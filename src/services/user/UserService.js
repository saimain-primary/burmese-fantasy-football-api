const UserModel = require("../../models/User");
const OTPModel = require("../../models/OTP");
const generateOTP = require("../../helpers/generateOTP");
const passwordHelper = require("../../helpers/password");
const { sendSMS } = require("../../helpers/sendSMS");

module.exports.getOne = async (data) => {
  return new Promise(function (resolve, reject) {
    UserModel.findOne(data).exec(function (err, doc) {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
};

module.exports.updateUserVerify = async (data) => {
  return new Promise(function (resolve, reject) {
    UserModel.findOneAndUpdate(
      { phone: data.phone, isVerified: false },
      { isVerified: true },
      {
        new: true,
      }
    ).exec(function (err, doc) {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
};

module.exports.saveUser = async (data) => {
  const userExist = await UserModel.find({ phone: data.phone });
  const saveData = {
    name: data.name,
    phone: data.phone,
    password: passwordHelper.HashPassword(data.password),
    region: data.region,
    favoriteTeam: data.favorite_team,
  };
  let savedUser = null;

  return new Promise(function (resolve, reject) {
    if (userExist.length > 0) {
      reject({
        flag: "already_exist",
        message: "Your phone number is already registered.",
      });
    } else {
      // const code = generateOTP.getCode();
      const code = "111111";

      UserModel.create(saveData, function (err, doc) {
        if (err) {
          reject(err);
        } else {
          savedUser = doc;
          const currentDate = new Date();

          const saveOTP = {
            code: code.toString(),
            phone: data.phone,
            expireAt: currentDate.setMinutes(currentDate.getMinutes() + 3),
          };
          OTPModel.create(saveOTP, function (err, doc) {
            if (err) {
              reject(err);
            } else {
              sendSMS({
                phone: data.phone,
                message: `${saveOTP.code} is your BFF verification code. Your code is valid for 3 minute.`,
              })
                .then(() => {
                  resolve(savedUser);
                })
                .catch((err) => {
                  reject(err);
                });
            }
          });
        }
      });
    }
  });
};
