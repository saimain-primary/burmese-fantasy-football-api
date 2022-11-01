const multer = require("multer");
const path = require("path");
const fs = require("fs");

const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg/;
  //check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload Images!!");
  }
};

const storageEngine = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

const deleteImage = function (file) {
  try {
    if (fs.existsSync(`./${file}`)) {
      fs.unlinkSync(`./${file}`);
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

module.exports = {
  storageEngine,
  deleteImage,
  checkFileType,
};
