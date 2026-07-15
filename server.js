import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// مهم جدا عشان github.io يقدر يكلم render
app.use(cors());
app.use(express.json({limit: '10mb'}));

const PORT = process.env.PORT || 10000;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// صفحة الاختبار
app.get("/", (req, res) => {
  res.send("👑 ShadowKing API is Running");
});

// API الشات
app.post("/api/chat", async (req, res) => {
  try {
    if(!GEMINI_KEY) {
      return res.status(500).json({text: "خطأ: GEMINI_API_KEY مش موجود في Render"});
    }

    const { prompt, mode, lang } = req.body;

    let system = `انت ShadowKing AI v14.2. انت ذكي وودود ومفيد. رد دايما باللغة ${lang}.`;

    if(mode === 'learn') {
      system += " انت معلم محترف. اشرح خطوة خطوة وبأمثلة بسيطة.";
    }
    if(mode === 'web') {
      system += " انت خبير برمجة مواقع. رد باكواد كاملة وجاهزة.";
    }

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        contents: [{parts: [{text: system + "\n\nالسؤال: " + prompt}]}]
      })
    });

    const data = await r.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "ما قدرت ارد هسا. جرب تاني";

    res.json({text});

  } catch (e) {
    console.error(e);
    res.status(500).json({text: "خطأ في السيرفر: " + e.message})
  }
});

app.listen(PORT, () => console.log(`👑 ShadowKing Live on ${PORT}`));