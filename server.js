import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// 1. تفعيل CORS عشان github.io يقدر يكلم السيرفر
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 10000;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// 2. صفحة الاختبار
app.get("/", (req, res) => {
  res.send("👑 ShadowKing API is Running - ai-proxy-qnen");
});

// 3. اهم نقطة: API الدردشة
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, mode = "chat", lang = "ar" } = req.body;

    if (!GEMINI_KEY) {
      return res.status(500).json({ text: "خطأ: مفتاح GEMINI_API_KEY مش موجود في السيرفر" });
    }
    if (!prompt) {
      return res.status(400).json({ text: "خطأ: الرسالة فاضية" });
    }

    // نظام للـ AI عشان يرد ملكي
    const systemPrompt = `انت ShadowKing AI. ذكاء اصطناعي ملكي فخم جدا. رد باللغة ${lang} وبأسلوب محترم وفخم.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: systemPrompt + "\n\nسؤال المستخدم: " + prompt }] }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1000
          }
        })
      }
    );

    const data = await response.json();

    // دي اهم سطر عشان ما يطلع undefined
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً يا ملك، ما قدرت اجيب رد من الذكاء الاصطناعي هسا. جرب تاني";

    res.json({ text: aiText });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ text: "خطأ في السيرفر: " + error.message });
  }
});

// 4. تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`👑 ShadowKing API Live on port ${PORT}`);
});