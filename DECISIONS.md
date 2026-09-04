\# Architecture Decisions



This document records the key engineering decisions made while building the Smart Market Watchlist, along with the reasoning behind them. Decisions are added as they are made, not written retroactively.



\---



\## Decision 001 — Definition of a Meaningful Stock Change



\### Decision

A stock update is considered a \*\*meaningful change\*\* when the latest live value differs from the price the user last saw by an amount that is significant relative to the stock's recent volatility baseline.



The system does not treat every small price movement as meaningful. Instead, it compares the current movement against both:

1\. An absolute change threshold.

2\. A volatility-adjusted threshold.



\### What "previous" means

`previousPrice` is \*\*not\*\* the last polled market tick — it is the price recorded in that user's `StockSnapshot` at the time they last viewed the stock. This is what makes the system answer "what changed since I last checked," rather than behaving like a live ticker. Two users checking the same stock at different times will see different deltas, because each is diffed against their own last-seen snapshot.



\### Volatility baseline

`volatilityBaseline` is computed per stock as:



```

volatilityBaseline (%) = avg(dailyHigh - dailyLow) over the last N days / avgPrice over the same period × 100

```



N defaults to 14 days. This gives each stock a personalized sense of "normal" movement, rather than applying the same threshold to every stock regardless of how volatile it typically is.



\### Significance rule

For an update:



```

priceChangePercent = ((currentPrice - previousPrice) / previousPrice) × 100

```



The update is considered meaningful when:



```

abs(priceChangePercent) >= max(absoluteThreshold, volatilityBaseline × multiplier)

```



The absolute threshold acts as a floor so that stocks with an unusually low or flat volatility baseline don't get flagged as "significant" over trivial moves. Both `absoluteThreshold` and `multiplier` are configurable values, not hard-coded constants, so they can be tuned without a redeploy of frontend logic.



\### First-time view (no prior snapshot)

If a stock has no existing `StockSnapshot` for a user (first time it's added or first time it's viewed), there is no `previousPrice` to diff against. In this case the stock is \*\*never classified as meaningful\*\* — it is shown with a "new" indicator instead of a significance badge. This avoids false positives caused by comparing against missing or default data.



\### Reasoning

Stock prices naturally fluctuate throughout the trading session. If every small movement triggered an alert or UI update, the system would become noisy and the signal would get lost. A meaningful-change mechanism lets the application distinguish between ordinary market movement and movement that is unusually large \*for that specific stock\*.



The volatility baseline provides stock-specific context: a 1% move may be significant for a low-volatility stock but unremarkable for a highly volatile one. Diffing against the user's last-seen snapshot (rather than market open or the last tick) directly reflects what the product is meant to answer: "what changed since I last checked?"



\### Consequence

The backend is solely responsible for calculating price differences and significance scores. The frontend consumes the backend's result rather than implementing its own significance logic. This keeps business logic centralized and ensures all clients apply the same definition of a meaningful change.



\---



\## Decision 002 — Separate Live Data, Snapshots, and Volatility Baseline



\### Decision

The backend maintains three conceptual data models:



\- \*\*`StockLiveData`\*\* — the latest available market data (price, volume, day high/low), shared across all users and refreshed by a single ingestion process.

\- \*\*`StockSnapshot`\*\* — a per-user, per-stock record of what that user last saw (price, volume, timestamp), used as the comparison point for diffing.

\- \*\*`VolatilityBaseline`\*\* — the stock's expected/normal price movement, precomputed on a schedule rather than recalculated on every request.



\### Reasoning

Keeping these responsibilities separate makes the diffing system easier to reason about and test in isolation. It also means volatility calculations can evolve (e.g. switching from a 14-day average to a more sophisticated model) without touching how live data is ingested or how snapshots are stored.



Separating `StockLiveData` (one row per stock, global) from `StockSnapshot` (one row per user per stock) also keeps the per-user storage small and cheap, which matters as the number of users and watchlist sizes grow — live prices are fetched once and shared, not duplicated per user.



\### Consequence

Each model has a single, clear responsibility. Ingestion, snapshotting, and baseline computation can be scaled or modified independently.



\---



\## Decision 003 — Backend Owns Diff and Significance Scoring



\### Decision

The backend calculates:

\- absolute price difference

\- percentage price difference

\- direction of movement

\- volatility-adjusted significance score

\- meaningful / non-meaningful classification (and severity tier, if applicable)



The frontend's job is to display these results, not to recompute them.



\### Reasoning

This prevents duplicated business logic between frontend and backend, avoids inconsistency if the app is later accessed from multiple clients (web, mobile, etc.), and makes future changes to the significance criteria a single-point change rather than a multi-client update.



\### Consequence

The frontend stays presentation-focused. Any change to thresholds, multipliers, or the scoring formula happens in one place.



\---



\## Decision 004 — Staleness Is Surfaced, Not Hidden



\### Decision

The frontend displays data age (e.g. "as of 2 min ago") rather than presenting all data as equally live. If the live feed has not updated a symbol within a configurable interval (default: 60 seconds), that symbol is flagged as \*\*stale\*\*, and significance scoring is paused for that symbol until fresh data arrives — a stale price is not diffed as if it were current.



\### Reasoning

Silently treating delayed or missing data as current risks showing misleading "changes" that are actually just gaps in the feed. Being explicit about data freshness is more honest and more useful to the user than pretending everything updates in real time.



\### Consequence

Every stock's UI state carries a `lastUpdatedAt` timestamp from `StockLiveData`, and the frontend derives a staleness indicator from it rather than assuming freshness.



\---



\## Open Questions / Future Considerations

\- How `absoluteThreshold` and `multiplier` should differ across asset classes if the watchlist expands beyond equities.

\- Whether volatility baseline should weight recent days more heavily (EMA) instead of a flat average.

\- Conflict resolution strategy if multiple data sources disagree (source priority vs. latest timestamp).

