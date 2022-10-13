const FixtureService = require("../../services/user/FixtureService");
module.exports.getFixtureList = async (req, res) => {
  let response = {};

  try {
    await FixtureService.getList()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {}
};
