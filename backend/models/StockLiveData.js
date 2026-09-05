const mongoose = require("mongoose");

const stockLiveDataSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    price: {
      type: Number,
      required: true
    },

    volume: {
      type: Number,
      default: 0
    },

    dayHigh: {
      type: Number,
      default: 0
    },

    dayLow: {
      type: Number,
      default: 0
    },

    lastUpdatedAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "StockLiveData",
  stockLiveDataSchema
);