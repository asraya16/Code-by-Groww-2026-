import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const getWatchlist = (userId) =>
  axios.get(`${API_BASE}/watchlist/${userId}`).then((res) => res.data);

export const addStock = (userId, symbol) =>
  axios.post(`${API_BASE}/watchlist/${userId}`, { symbol }).then((res) => res.data);

export const removeStock = (userId, symbol) =>
  axios.delete(`${API_BASE}/watchlist/${userId}/${symbol}`).then((res) => res.data);

export const markAsSeen = (symbol, userId) =>
  axios.post(`${API_BASE}/stocks/${symbol}/snapshot`, { userId }).then((res) => res.data);