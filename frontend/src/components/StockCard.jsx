export default function StockCard({ stock, onMarkSeen }) {
  const badge = () => {
    if (stock.isNew) return { label: "NEW", color: "#888" };
    if (stock.stale) return { label: "STALE", color: "#bbb" };
    if (stock.isMeaningful) {
      return stock.direction === "UP"
        ? { label: "🔴 UP", color: "#1a7f37" }
        : { label: "🔴 DOWN", color: "#cf222e" };
    }
    return { label: "No major change", color: "#999" };
  };

  const b = badge();

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "16px",
      marginBottom: "12px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <h3 style={{ margin: 0 }}>{stock.symbol}</h3>
        <p style={{ margin: "4px 0", color: "#555" }}>
          ₹{stock.currentPrice}
          {stock.priceChangePercent !== null && (
            <span style={{ marginLeft: "8px" }}>
              ({stock.priceChangePercent > 0 ? "+" : ""}{stock.priceChangePercent}%)
            </span>
          )}
        </p>
      </div>

      <div style={{ textAlign: "right" }}>
        <span style={{
          padding: "4px 10px",
          borderRadius: "20px",
          background: b.color,
          color: "#fff",
          fontSize: "12px",
          fontWeight: 600
        }}>
          {b.label}
        </span>
        <br />
        <button onClick={() => onMarkSeen(stock.symbol)} style={{ marginTop: "8px" }}>
          Mark as seen
        </button>
      </div>
    </div>
  );
}