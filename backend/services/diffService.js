const VolatilityBaseline = require("../models/VolatilityBaseline");

const DEFAULT_ABSOLUTE_THRESHOLD = 0.5;
const DEFAULT_MULTIPLIER = 1.5;
const STALE_AFTER_MS = 60 * 1000;

async function calculateStockDiff(
  currentData,
  previousSnapshot,
  config = {}
) {
  const absoluteThreshold =
    config.absoluteThreshold ??
    DEFAULT_ABSOLUTE_THRESHOLD;

  const multiplier =
    config.multiplier ??
    DEFAULT_MULTIPLIER;

  if (!currentData) {
    throw new Error("Current stock data is required");
  }

  /*
   FIRST-TIME VIEW

   No snapshot means the user has never
   viewed this stock before.
  */

  if (!previousSnapshot) {
    return {
      symbol: currentData.symbol,

      currentPrice: currentData.price,
      previousPrice: null,

      priceDifference: null,
      priceChangePercent: null,

      direction: "NEW",

      isMeaningful: false,
      isNew: true,

      stale: isStale(
        currentData.lastUpdatedAt
      ),

      lastUpdatedAt:
        currentData.lastUpdatedAt
    };
  }

  /*
   STALENESS CHECK

   If market data hasn't updated within
   60 seconds, don't calculate significance.
  */

  const stale = isStale(
    currentData.lastUpdatedAt
  );

  if (stale) {
    return {
      symbol: currentData.symbol,

      currentPrice: currentData.price,
      previousPrice: previousSnapshot.price,

      priceDifference: null,
      priceChangePercent: null,

      direction: "UNKNOWN",

      isMeaningful: false,
      isNew: false,

      stale: true,

      lastUpdatedAt:
        currentData.lastUpdatedAt,

      message:
        "Live data is stale. Significance scoring paused."
    };
  }

  /*
   PRICE DIFFERENCE
  */

  const priceDifference =
    currentData.price -
    previousSnapshot.price;

  /*
   PERCENTAGE DIFFERENCE
  */

  const priceChangePercent =
    (priceDifference /
      previousSnapshot.price) *
    100;

  /*
   GET VOLATILITY BASELINE
  */

  const baseline =
    await VolatilityBaseline.findOne({
      symbol: currentData.symbol
    });

  const volatilityPercent =
    baseline?.volatilityPercent ?? 0;

  /*
   VOLATILITY-ADJUSTED THRESHOLD
  */

  const volatilityThreshold =
    volatilityPercent *
    multiplier;

  /*
   FINAL THRESHOLD
  */

  const significanceThreshold =
    Math.max(
      absoluteThreshold,
      volatilityThreshold
    );

  /*
   MEANINGFUL CHANGE
  */

  const isMeaningful =
    Math.abs(priceChangePercent) >=
    significanceThreshold;

  /*
   DIRECTION
  */

  let direction = "UNCHANGED";

  if (priceDifference > 0) {
    direction = "UP";
  }

  if (priceDifference < 0) {
    direction = "DOWN";
  }

  /*
   SIGNIFICANCE SCORE
  */

  const significanceScore =
    volatilityPercent > 0
      ? Math.abs(priceChangePercent) /
        volatilityPercent
      : 0;

  return {
    symbol: currentData.symbol,

    currentPrice: currentData.price,
    previousPrice: previousSnapshot.price,

    priceDifference:
      Number(priceDifference.toFixed(2)),

    priceChangePercent:
      Number(
        priceChangePercent.toFixed(2)
      ),

    direction,

    volatilityPercent,

    significanceThreshold:
      Number(
        significanceThreshold.toFixed(2)
      ),

    significanceScore:
      Number(
        significanceScore.toFixed(2)
      ),

    isMeaningful,

    isNew: false,

    stale: false,

    lastUpdatedAt:
      currentData.lastUpdatedAt
  };
}


/*
  Returns true if live market data is
  older than 60 seconds.
*/

function isStale(lastUpdatedAt) {
  if (!lastUpdatedAt) {
    return true;
  }

  return (
    Date.now() -
      new Date(
        lastUpdatedAt
      ).getTime() >
    STALE_AFTER_MS
  );
}


module.exports = {
  calculateStockDiff
};