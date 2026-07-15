import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import archiver from "archiver";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
const PORT = process.env.PORT || 10000;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

app.get("/", (req,res) => res.send("👑 ShadowKing API is Running"));

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, mode = "chat" } = req.body;
    let systemPrompt = "انت ShadowKing AI الملك. رد باحتراف وفخامة.";

    if(mode === "code") systemPrompt = "انت مبرمج محترف. اكتب كود كامل مع الشرح.";
    if(mode === "app") systemPrompt = "انت مطور تطبيقات. اكتب كود تطبيق كامل HTML/CSS/JS وارجعه كملف zip.";
    if(mode === "game3d") systemPrompt = "انت مطور العاب 3D. اكتب كود لعبة Three.js كاملة.";
    if(mode === "website") systemPrompt = "انت مصمم مواقع. اكتب كود موقع كامل HTML/CSS/JS وارجعه كملف zip.";
    if(mode === "learn") systemPrompt = "انت معلم برمجة. اشرح بالتفصيل مع امثلة.";

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({contents: [{parts: [{text: systemPrompt + "\n\n" + prompt}]}]})
    });
    const data = await r.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذرا يا ملك، ما قدرت ارد";
    res.json({text: text});
  } catch (e) {
    res.status(500).json({text: "خطأ: " + e.message})
  }
});

app.listen(PORT, () => console.log(`👑 Live on ${PORT}`));