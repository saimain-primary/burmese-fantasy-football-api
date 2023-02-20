const UserModel = require("../../models/User");
const OTPModel = require("../../models/OTP");
const generateOTP = require("../../helpers/generateOTP");
const passwordHelper = require("../../helpers/password");
const { sendSMS } = require("../../helpers/sendSMS");
const AuthService = require("../user/AuthService");
const { default: mongoose } = require("mongoose");
const { deleteImage } = require("../../helpers/imageUpload");

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
      const code = generateOTP.getCode();
      // const code = "111111";

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

module.exports.updateUser = async (data) => {
  return new Promise(function (resolve, reject) {
    const updateData = {
      name: data.name,
      phone: data.phone,
      region: data.region,
      favoriteTeam: data.favorite_team,
    };

    UserModel.findOneAndUpdate({ phone: data.phone }, updateData, {
      new: true,
    }).exec(function (err, doc) {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
};

module.exports.updateProfileImage = async (req) => {
  return new Promise(function (resolve, reject) {
    const userId = AuthService.getUserIDByToken(req);
    if (userId) {
      const updateData = {
        profileImage: req.file.path,
      };

      UserModel.findById(mongoose.Types.ObjectId(userId))
        .then(async (doc) => {
          console.log("user data", doc);
          await deleteImage(doc.profileImage);
        })
        .catch((err) => {
          reject(err);
        });

      UserModel.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(userId) },
        updateData,
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
    } else {
      reject("Not Authenticated");
    }
  });
};

module.exports.getUserByID = async (id) => {
  return new Promise(function (resolve, reject) {
    UserModel.findById(mongoose.Types.ObjectId(id))
      .then(async (doc) => {
        resolve(doc);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
