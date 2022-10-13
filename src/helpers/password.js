const bcrypt = require("bcryptjs");
const saltRounds = 12;

module.exports.HashPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

module.exports.ComparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};
