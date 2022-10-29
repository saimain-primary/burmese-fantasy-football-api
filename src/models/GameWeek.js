const mongoose = require("mongoose");

const GameWeekSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    week: {
      type: String,
      required: true,
      unique: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
      required: true,
    },
    isHomePageCurrent: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const GameWeekDoc = mongoose.model("GameWeek", GameWeekSchema);

module.exports = GameWeekDoc;
