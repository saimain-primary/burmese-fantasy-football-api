const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema(
  {
    home: {
      type: String,
      required: true,
    },
    away: {
      type: String,
      required: true,
    },
    boosted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Prediction = mongoose.model("Prediction", PredictionSchema);

module.exports = Prediction;
