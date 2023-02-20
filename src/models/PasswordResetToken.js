const mongoose = require("mongoose");

const PasswordResetTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
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

const PasswordResetToken = mongoose.model(
    "password_reset_token",
    PasswordResetTokenSchema
);

module.exports = PasswordResetToken;
