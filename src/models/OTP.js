const mongoose = require("mongoose");

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
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
