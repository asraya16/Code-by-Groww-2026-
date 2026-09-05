const express = require("express");
const Watchlist = require("../models/Watchlist");
const StockLiveData = require("../models/StockLiveData");
const StockSnapshot = require("../models/StockSnapshot");
const { calculateStockDiff } = require("../services/diffService");

const router = express.Router();

// GET /api/watchlist/:userId  → all tracked stocks WITH diffs, sorted by significance
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const items = await Watchlist.find({ userId });
    if (items.length === 0) {
      return res.json({ userId, stocks: [] });
    }

    const symbols = items.map((i) => i.symbol);

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const currentData = await StockLiveData.findOne({ symbol });
        if (!currentData) return null;

        const previousSnapshot = await StockSnapshot.findOne({ userId, symbol });
        return calculateStockDiff(currentData, previousSnapshot);
      })
    );

    const stocks = results
      .filter(Boolean)
      .sort((a, b) => (b.significanceScore ?? 0) - (a.significanceScore ?? 0));

    res.json({ userId, stocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch watchlist", error: error.message });
  }
});

// POST /api/watchlist/:userId  { symbol: "RELIANCE" } → add a stock
router.post("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ message: "symbol is required" });
    }

    const item = await Watchlist.findOneAndUpdate(
      { userId, symbol: symbol.toUpperCase() },
      { userId, symbol: symbol.toUpperCase() },
      { returnDocument: "after", upsert: true }
    );

    res.json({ message: "Stock added to watchlist", item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add stock", error: error.message });
  }
});

// DELETE /api/watchlist/:userId/:symbol → remove a stock
router.delete("/:userId/:symbol", async (req, res) => {
  try {
    const { userId, symbol } = req.params;

    await Watchlist.findOneAndDelete({ userId, symbol: symbol.toUpperCase() });

    res.json({ message: "Stock removed from watchlist" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove stock", error: error.message });
  }
});

module.exports = router;