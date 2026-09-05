const mongoose = require("mongoose");

const stockSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },

    symbol: {
      type: String,
      required: true,
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

    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

stockSnapshotSchema.index(
  { userId: 1, symbol: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "StockSnapshot",
  stockSnapshotSchema
);