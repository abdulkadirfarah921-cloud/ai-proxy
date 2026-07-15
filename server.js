import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_API_KEY;

app.get("/", (req, res) => {
  res.send("👑 ShadowKing API is Running on ai-proxy-qnen");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, mode, lang } = req.body;
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({contents: [{parts: [{text: prompt}]}]})
    });
    const data = await r.json();
    res.json({text: data.candidates?.[0]?.content?.parts?.[0]?.text});
  } catch (e) {
    res.status(500).json({text: "خطأ: " + e.message})
  }
});

app.listen(10000, () => console.log("Live"));