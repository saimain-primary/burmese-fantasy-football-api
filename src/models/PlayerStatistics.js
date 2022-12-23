const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    leagueId: {
      type: String,
    },
    fixtureId: {
      type: String,
    },
    team: {
      type: Object,
    },
    player: {
      type: Object,
    },
    statistics: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const Doc = mongoose.model("player_statistics", Schema);

module.exports = Doc;
