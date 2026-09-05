import { useEffect, useState } from "react";
import { getWatchlist, addStock, removeStock, markAsSeen } from "./api/watchlist";
import StockCard from "./components/StockCard";
import AddStock from "./components/AddStock";

const USER_ID = "testuser"; // hardcoded for now, no auth yet

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    setLoading(true);
    const data = await getWatchlist(USER_ID);
    setStocks(data.stocks);
    setLoading(false);
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAdd = async (symbol) => {
    await addStock(USER_ID, symbol);
    fetchWatchlist();
  };

  const handleMarkSeen = async (symbol) => {
    await markAsSeen(symbol, USER_ID);
    fetchWatchlist();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Smart Market Watchlist</h1>
      <AddStock onAdd={handleAdd} />

      {loading ? (
        <p>Loading...</p>
      ) : stocks.length === 0 ? (
        <p>No stocks yet. Add one above.</p>
      ) : (
        stocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} onMarkSeen={handleMarkSeen} />
        ))
      )}
    </div>
  );
}