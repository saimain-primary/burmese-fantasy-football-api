const mongoose = require("mongoose");

const ForgetPasswordOTPSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        is_used: {
            type: Boolean,
            default: false,
            required: true,
        },
        expired_at: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const ForgetPasswordOTP = mongoose.model(
    "forget_password_otp",
    ForgetPasswordOTPSchema
);

module.exports = ForgetPasswordOTP;
