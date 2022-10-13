const mongoose = require("mongoose");

const currentDate = new Date();

const OTPSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
      required: true,
    },
    expireAt: {
      type: Date,
      default: currentDate.setMinutes(currentDate.getMinutes() + 1),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
