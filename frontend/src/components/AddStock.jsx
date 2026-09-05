import { useState } from "react";

export default function AddStock({ onAdd }) {
  const [symbol, setSymbol] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    onAdd(symbol.trim().toUpperCase());
    setSymbol("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px", display: "flex", gap: "8px" }}>
      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="e.g. TCS"
        style={{ padding: "8px", flex: 1 }}
      />
      <button type="submit">Add to watchlist</button>
    </form>
  );
}