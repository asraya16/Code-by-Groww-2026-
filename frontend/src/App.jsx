import { useEffect, useState, useCallback } from "react";
import { getWatchlist, addStock, removeStock, markAsSeen } from "./api/watchlist";
import StockCard from "./components/StockCard";
import AddStock from "./components/AddStock";

const USER_ID = "testuser";
const REFRESH_INTERVAL_MS = 15000;

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchWatchlist = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getWatchlist(USER_ID);
      setStocks(data.stocks);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch watchlist", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist(true);
    const interval = setInterval(() => fetchWatchlist(false), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchWatchlist]);

  const handleAdd = async (symbol) => {
    await addStock(USER_ID, symbol);
    fetchWatchlist(false);
  };

  const handleMarkSeen = async (symbol) => {
    await markAsSeen(symbol, USER_ID);
    fetchWatchlist(false);
  };

  const handleRemove = async (symbol) => {
    await removeStock(USER_ID, symbol);
    fetchWatchlist(false);
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Smart Market Watchlist</h1>
        <p>Not another ticker — this shows what actually deserves your attention since you last checked.</p>
      </div>

      <div className="legend">
        <div className="legend-item"><span className="dot up"></span> Significant move up</div>
        <div className="legend-item"><span className="dot down"></span> Significant move down</div>
        <div className="legend-item"><span className="dot new"></span> Never viewed</div>
        <div className="legend-item"><span className="dot stale"></span> Data delayed / paused</div>
      </div>

      <AddStock onAdd={handleAdd} />

      <div className="status-bar">
        <span>{stocks.length} stock{stocks.length !== 1 ? "s" : ""} tracked</span>
        <span>
          {lastRefreshed ? `Refreshed ${lastRefreshed.toLocaleTimeString()}` : ""}{" "}
          <button className="refresh-btn" onClick={() => fetchWatchlist(true)}>Refresh now</button>
        </span>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      ) : stocks.length === 0 ? (
        <div className="empty-state">
          <p>Your watchlist is empty.</p>
          <p>Add a stock above to start tracking meaningful changes.</p>
        </div>
      ) : (
        stocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onMarkSeen={handleMarkSeen}
            onRemove={handleRemove}
          />
        ))
      )}
    </div>
  );
}