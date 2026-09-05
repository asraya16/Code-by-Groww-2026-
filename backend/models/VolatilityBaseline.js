const mongoose = require("mongoose");

const volatilityBaselineSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    volatilityPercent: {
      type: Number,
      required: true,
      min: 0
    },

    windowSize: {
      type: Number,
      default: 14
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model(
  "VolatilityBaseline",
  volatilityBaselineSchema
);