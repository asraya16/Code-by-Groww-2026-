require("dotenv").config();
const mongoose = require("mongoose");

const StockLiveData = require("./models/StockLiveData");
const VolatilityBaseline = require("./models/VolatilityBaseline");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected. Seeding data...");

  await StockLiveData.deleteMany({});
  await VolatilityBaseline.deleteMany({});

  await StockLiveData.insertMany([
    { symbol: "TCS", price: 3850, volume: 120000, dayHigh: 3900, dayLow: 3800, lastUpdatedAt: new Date() },
    { symbol: "INFY", price: 1550, volume: 95000, dayHigh: 1580, dayLow: 1530, lastUpdatedAt: new Date() },
    { symbol: "RELIANCE", price: 2900, volume: 250000, dayHigh: 2940, dayLow: 2870, lastUpdatedAt: new Date() },
    { symbol: "ADANIENT", price: 3100, volume: 180000, dayHigh: 3250, dayLow: 3050, lastUpdatedAt: new Date() },
    { symbol: "HDFCBANK", price: 1650, volume: 200000, dayHigh: 1665, dayLow: 1640, lastUpdatedAt: new Date() },
    { symbol: "ZOMATO", price: 260, volume: 500000, dayHigh: 280, dayLow: 250, lastUpdatedAt: new Date() }
  ]);

  await VolatilityBaseline.insertMany([
    { symbol: "TCS", volatilityPercent: 1.2 },       // low volatility, "boring" stock
    { symbol: "INFY", volatilityPercent: 1.5 },
    { symbol: "RELIANCE", volatilityPercent: 1.0 },  // very stable, blue-chip
    { symbol: "ADANIENT", volatilityPercent: 3.5 },  // naturally volatile
    { symbol: "HDFCBANK", volatilityPercent: 0.8 },  // very low, small moves matter a lot here
    { symbol: "ZOMATO", volatilityPercent: 5.0 }     // highly volatile, needs big moves to count
  ]);

  console.log("Seed data inserted — 6 stocks with varied volatility profiles");
  mongoose.disconnect();
});