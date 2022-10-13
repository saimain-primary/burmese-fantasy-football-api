const dotenv = require("dotenv");
dotenv.config();

const SMSPOH_TOKEN = process.env.SMSPOH_TOKEN;
const SMSPOH_BASE_URL = "https://smspoh.com/api/";
const axios = require("axios");

module.exports.sendSMS = async (data) => {
  return new Promise(function (resolve, reject) {
    axios
      .post(
        SMSPOH_BASE_URL + "/v2/send",
        {
          to: data.phone,
          message: data.message,
          sender: "BFF",
        },
        {
          headers: {
            Authorization: `Bearer ${SMSPOH_TOKEN}`,
          },
        }
      )
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
