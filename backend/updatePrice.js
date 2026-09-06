require("dotenv").config();
const mongoose = require("mongoose");
const StockLiveData = require("./models/StockLiveData");

const symbol = process.argv[2];
const newPrice = parseFloat(process.argv[3]);

if (!symbol || !newPrice) {
  console.log("Usage: node updatePrice.js SYMBOL PRICE");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const updated = await StockLiveData.findOneAndUpdate(
    { symbol: symbol.toUpperCase() },
    { price: newPrice, lastUpdatedAt: new Date() },
    { returnDocument: "after" }
  );
  console.log("Updated:", updated);
  mongoose.disconnect();
});