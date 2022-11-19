const mongoose = require("mongoose");

const PredictionSchema = new mongoose.Schema(
  {
    league_id : {
      type: String
    },
    user_id: {
      type: "ObjectId",
      required: true,
    },
    fixture_id: {
      type: String,
      required: true,
    },
    week: {
      type: String,
      required: true,
    },
    home_team: {
      type: Object,
    },
    away_team: {
      type: Object,
    },
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
    details: {
      type: Object,
    }
  },
  {
    timestamps: true,
  }
);

const Prediction = mongoose.model("Prediction", PredictionSchema);

module.exports = Prediction;
