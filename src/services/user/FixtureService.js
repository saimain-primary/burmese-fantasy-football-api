const axios = require("axios");

module.exports.getList = async (params) => {
  axios
    .get("/fixtures", {
      params: {},
    })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
};
