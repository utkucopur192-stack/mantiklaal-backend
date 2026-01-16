console.log("SERVER STARTING 123");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

process.on("uncaughtException", (e) => console.error("UNCAUGHT:", e));
process.on("unhandledRejection", (e) => console.error("REJECTION:", e));

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return res.status(400).json({ error: "q missing" });

    const params = new URLSearchParams({
      engine: "google_shopping",
      q,
      hl: "tr",
      gl: "tr",
      num: "10",
      api_key: process.env.SERPAPI_KEY || "",
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;

    const r = await fetch(url);
    const data = await r.json();

    const results = (data.shopping_results || []).map((x) => ({
      title: x.title,
      price: x.extracted_price ?? x.price,
      source: x.source,
      link: x.link,
      rating: x.rating,
      reviews: x.reviews,
      thumbnail: x.thumbnail,
    }));

    res.json({ query: q, results });
  } catch (e) {
    res.status(500).json({ error: "server_error", detail: String(e) });
  }
});

const PORT = process.env.PORT || 8790;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Backend running on PORT =", PORT);
});
