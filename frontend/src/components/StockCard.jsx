export default function StockCard({ stock, onMarkSeen, onRemove }) {
  const getStatus = () => {
    if (stock.isNew) return "new";
    if (stock.stale) return "stale";
    if (stock.direction === "UP") return "up";
    if (stock.direction === "DOWN") return "down";
    return "none";
  };

  const status = getStatus();

  const badgeLabel = () => {
    if (stock.isNew) return "NEW";
    if (stock.stale) return "STALE DATA";
    if (stock.isMeaningful && stock.direction === "UP") return "▲ SIGNIFICANT";
    if (stock.isMeaningful && stock.direction === "DOWN") return "▼ SIGNIFICANT";
    return "No major change";
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return `${Math.floor(diffSec / 3600)}h ago`;
  };

  return (
    <div className={`stock-card ${status}`}>
      <div>
        <p className="stock-symbol">{stock.symbol}</p>
        <p className="stock-price">
          ₹{stock.currentPrice}
          {stock.priceChangePercent !== null && (
            <span className={stock.priceChangePercent > 0 ? "change-up" : "change-down"}>
              {" "}({stock.priceChangePercent > 0 ? "+" : ""}{stock.priceChangePercent}%)
            </span>
          )}
        </p>
        <p className="stock-meta">
          {stock.isNew
            ? "Never viewed before"
            : `Since your last visit · ${timeAgo(stock.lastUpdatedAt)} old data`}
          {stock.significanceScore != null && !stock.isNew && !stock.stale && (
            <> · significance {stock.significanceScore}x baseline</>
          )}
        </p>
      </div>

      <div className="card-actions">
        <span className={`badge ${status}`}>{badgeLabel()}</span>
        <div className="action-row">
          <button className="icon-btn" onClick={() => onMarkSeen(stock.symbol)}>Mark seen</button>
          <button className="icon-btn" onClick={() => onRemove(stock.symbol)}>Remove</button>
        </div>
      </div>
    </div>
  );
}