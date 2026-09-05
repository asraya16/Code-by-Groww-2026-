const dns = require("dns");
dns.setServers(["8.8.8.8"]);

require("dotenv").config();
const mongoose = require("mongoose");

const StockLiveData = require("./models/StockLiveData");
const VolatilityBaseline = require("./models/VolatilityBaseline");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected. Seeding data...");

  await StockLiveData.deleteMany({});
  await VolatilityBaseline.deleteMany({});

  await StockLiveData.insertMany([
    {
      symbol: "TCS",
      price: 3850,
      volume: 120000,
      dayHigh: 3900,
      dayLow: 3800,
      lastUpdatedAt: new Date()
    },
    {
      symbol: "INFY",
      price: 1550,
      volume: 95000,
      dayHigh: 1580,
      dayLow: 1530,
      lastUpdatedAt: new Date()
    }
  ]);

  await VolatilityBaseline.insertMany([
    { symbol: "TCS", volatilityPercent: 1.2 },
    { symbol: "INFY", volatilityPercent: 2.0 }
  ]);

  console.log("Seed data inserted");
  mongoose.disconnect();
});