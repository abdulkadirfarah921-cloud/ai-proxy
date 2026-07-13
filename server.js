const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const app = express();
app.use(cors()); // اهم سطر
app.use(express.json({limit: '50mb'}));
app.use('/downloads', express.static('downloads'));

app.get('/', (req,res) => res.send("ShadowKing Server is Running 👑")) // عشان نتأكد

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

async function gpt(prompt){ try{const r = await openai.chat.completions.create({model: "gpt-4o", messages: [{role:"user", content:prompt}]}); return r.choices[0].message.content;}catch(e){return "خطأ: " + e.message} }
async function claude(prompt){ try{const r = await anthropic.messages.create({model: "claude-3-5-sonnet-20241022", max_tokens: 4000, messages: [{role:"user", content:prompt}]}); return r.content[0].text;}catch(e){return "خطأ: " + e.message} }
async function geminiPro(prompt){ try{const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" }); const r = await model.generateContent(prompt); return r.response.text();}catch(e){return "خطأ: " + e.message} }
async function geminiImage(prompt){ try{const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" }); const r = await model.generateContent(prompt); return r.response.candidates[0].content.parts[0].inlineData; }catch(e){return null} }

app.post('/api/chat', async (req, res) => {
    const { prompt, model } = req.body;
    let answer = "";
    if(model === 'shadow' || model === 'gemini') answer = await geminiPro(prompt);
    if(model === 'gpt') answer = await gpt(prompt);
    if(model === 'claude') answer = await claude(prompt);
    res.json({ text: answer });
});

app.post('/api/build-web', async (req, res) => {
    const { prompt, lang } = req.body;
    const siteName = "ShadowSite_" + Date.now();
    const sitePath = path.join(__dirname, 'downloads', siteName);
    fs.mkdirSync(sitePath, { recursive: true });
    const code = await gpt(`اكتب كود موقع HTML كامل صفحة واحدة حسب: ${prompt}. اللغة: ${lang}. رجع كود HTML فقط`);
    fs.writeFileSync(path.join(sitePath, 'index.html'), code);
    const zipPath = path.join(__dirname, 'downloads', siteName + '.zip');
    const archive = archiver('zip'); archive.pipe(fs.createWriteStream(zipPath)); archive.directory(sitePath, false); await archive.finalize();
    res.json({ text: `👑 تم صنع الموقع: ${prompt}`, downloadUrl: `https://ai-proxy-qnen.onrender.com/downloads/${siteName}.zip` });
});

app.post('/api/build-apk', async (req, res) => {
    const { prompt, lang } = req.body;
    const appName = "ShadowApp_" + Date.now();
    const appPath = path.join(__dirname, 'downloads', appName);
    fs.mkdirSync(appPath, { recursive: true });
    const codeString = await gpt(`اكتب كود تطبيق Flutter كامل حسب: ${prompt}. اللغة: ${lang}. رجع JSON: {"pubspec.yaml":"...","lib/main.dart":"..."}`);
    try{
        const files = JSON.parse(codeString);
        for(const fileName in files){ fs.writeFileSync(path.join(appPath, fileName), files[fileName]); }
        const zipPath = path.join(__dirname, 'downloads', appName + '.zip');
        const archive = archiver('zip'); archive.pipe(fs.createWriteStream(zipPath)); archive.directory(appPath, false); await archive.finalize();
        res.json({ text: `👑 تم صنع التطبيق: ${prompt}`, downloadUrl: `https://ai-proxy-qnen.onrender.com/downloads/${appName}.zip` });
    }catch(e){ res.json({ text: `👑 هذا كود التطبيق:\n\n${codeString}` }) }
});

app.post('/api/generate-image', async (req, res) => {
    const { prompt } = req.body;
    const image = await geminiImage(`انشئ صورة عالية الدقة: ${prompt}`);
    if(image) res.json({ imageData: image.data, mimeType: image.mimeType });
    else res.json({ text: "اسف ما قدرت اولد الصورة" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));