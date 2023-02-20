const mongoose = require("mongoose");

const LeagueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    league_id: {
      type: Number,
      required: true
    },
    is_current: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LeagueDoc = mongoose.model("League", LeagueSchema);

module.exports = LeagueDoc;
