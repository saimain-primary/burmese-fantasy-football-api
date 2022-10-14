const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRE_AT,
    });
    if (decoded) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

const checkAdminToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRE_AT,
    });
    if (decoded) {
      return decoded;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
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

module.exports.check = (req, res, next) => {
  const token = extractToken(req);
  if (checkToken(token)) {
    next();
  } else {
    return res.status(200).json({
      code: 401,
      flag: "unauthorized",
      message: "Unauthorized, Please login to your account",
      developer_message: "Unauthorized",
      results: null,
    });
  }
};

module.exports.checkAdmin = (req, res, next) => {
  const token = extractToken(req);
  const decoded = checkAdminToken(token);
  if (decoded && decoded.isAdmin) {
    next();
  } else {
    return res.status(200).json({
      code: 401,
      flag: "unauthorized",
      message: "Unauthorized, Please login to your account",
      developer_message: "Unauthorized",
      results: null,
    });
  }
};
