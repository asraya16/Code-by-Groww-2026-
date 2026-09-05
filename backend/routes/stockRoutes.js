const express = require("express");

const StockLiveData = require("../models/StockLiveData");
const StockSnapshot = require("../models/StockSnapshot");

const {
  calculateStockDiff
} = require("../services/diffService");

const router = express.Router();


/*
====================================================
GET STOCK DIFFERENCE
====================================================

Example:

GET /api/stocks/RELIANCE/diff?userId=user123
*/

router.get(
  "/:symbol/diff",
  async (req, res) => {
    try {
      const symbol =
        req.params.symbol.toUpperCase();

      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          message: "userId is required"
        });
      }

      /*
       Get latest shared market data
      */

      const currentData =
        await StockLiveData.findOne({
          symbol
        });

      if (!currentData) {
        return res.status(404).json({
          message:
            "Current stock data not found"
        });
      }

      /*
       Get THIS USER'S last-seen snapshot
      */

      const previousSnapshot =
        await StockSnapshot.findOne({
          userId,
          symbol
        });

      /*
       Calculate difference
      */

      const result =
        await calculateStockDiff(
          currentData,
          previousSnapshot
        );

      res.json(result);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to calculate stock difference",

        error: error.message
      });
    }
  }
);


/*
====================================================
SAVE USER SNAPSHOT
====================================================

Called when the user actually views the stock.

POST /api/stocks/RELIANCE/snapshot
*/

router.post(
  "/:symbol/snapshot",
  async (req, res) => {
    try {
      const symbol =
        req.params.symbol.toUpperCase();

      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          message: "userId is required"
        });
      }

      /*
       Get current market price
      */

      const currentData =
        await StockLiveData.findOne({
          symbol
        });

      if (!currentData) {
        return res.status(404).json({
          message:
            "Current stock data not found"
        });
      }

      /*
       Create/update user's snapshot
      */

      const snapshot =
        await StockSnapshot.findOneAndUpdate(
          {
            userId,
            symbol
          },

          {
            userId,
            symbol,

            price: currentData.price,

            volume:
              currentData.volume,

            timestamp: new Date()
          },

          {
            returnDocument: "after",
            upsert: true
          }
        );

      res.json({
        message:
          "Stock marked as seen",

        snapshot
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to create snapshot",

        error: error.message
      });
    }
  }
);


module.exports = router;