const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver'); // اضف هذا

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use('/downloads', express.static('downloads')); // عشان ننزل الملفات

// المفاتيح من Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

async function gpt(prompt){ const r = await openai.chat.completions.create({model: "gpt-4o", messages: [{role:"user", content:prompt}]}); return r.choices[0].message.content; }
async function claude(prompt){ const r = await anthropic.messages.create({model: "claude-3-5-sonnet-20241022", max_tokens: 4000, messages: [{role:"user", content:prompt}]}); return r.content[0].text; }
async function geminiPro(prompt){ const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" }); const r = await model.generateContent(prompt); return r.response.text(); }

// API الشات العادي
app.post('/api/chat', async (req, res) => {
    const { prompt, model } = req.body;
    let answer = "";
    if(model === 'shadow') answer = await geminiPro(prompt);
    if(model === 'gpt') answer = await gpt(prompt);
    if(model === 'claude') answer = await claude(prompt);
    if(model === 'gemini') answer = await geminiPro(prompt);
    res.json({ text: answer });
});

// API الجديد: صنع APK
app.post('/api/build-apk', async (req, res) => {
    const { prompt, lang } = req.body;
    const appName = "ShadowApp_" + Date.now();
    const appPath = path.join(__dirname, 'downloads', appName);

    try {
        fs.mkdirSync(appPath, { recursive: true });

        // 1. نخلي GPT-5 يولد كود تطبيق Flutter كامل
        const codePrompt = `انت مبرمج Flutter محترف. اكتبلي كود تطبيق كامل حسب الطلب: ${prompt}. اللغة: ${lang}
        رجع الجواب كـ JSON فقط. الشكل:
        {
          "pubspec.yaml": "الكود كامل",
          "lib/main.dart": "الكود كامل"
        }
        لازم الكود يشتغل مباشرة بدون اخطاء`;

        const appCodeString = await gpt(codePrompt);
        const files = JSON.parse(appCodeString);

        // 2. نكتب الملفات
        for(const fileName in files){
            const fileDir = path.dirname(path.join(appPath, fileName));
            fs.mkdirSync(fileDir, { recursive: true });
            fs.writeFileSync(path.join(appPath, fileName), files[fileName]);
        }

        // 3. نضغط المجلد zip
        const zipPath = path.join(__dirname, 'downloads', appName + '.zip');
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(appPath, false);
        await archive.finalize();

        const downloadUrl = `https://ai-proxy-qnen.onrender.com/downloads/${appName}.zip`;
        res.json({ text: `👑 تم صنع تطبيق: ${prompt}`, downloadUrl: downloadUrl });

    } catch(e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));