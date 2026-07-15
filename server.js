const express = require('express');
const cors = require('cors');
const axios = require('axios');
const JSZip = require('jszip');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({limit: '50mb'}));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const GITHUB_USER = "abdulkadirfarah921-cloud";

app.post('/api/chat', async (req, res) => {
  const { prompt, mode } = req.body;
  const projectName = prompt.replace(/\s/g, "-").substring(0,25).toLowerCase();

  try {
    if(mode === 'website') {
      const htmlCode = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>${prompt}</title><style>body{background:linear-gradient(135deg,#1a0033,#000);color:white;text-align:center;padding:100px 20px;font-family:Cairo;margin:0;}h1{font-size:50px;color:#FFD700;}</style></head><body><h1>👑 ${prompt}</h1><p>تم صنعه بالذكاء الاصطناعي الملك</p></body></html>`;

      await axios.post(`https://api.github.com/user/repos`, { name: projectName, auto_init: true }, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });
      await axios.put(`https://api.github.com/repos/${GITHUB_USER}/${projectName}/contents/index.html`, { message: "Created by ShadowKing AI", content: Buffer.from(htmlCode).toString('base64') }, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });
      await axios.post(`https://api.github.com/repos/${GITHUB_USER}/${projectName}/pages`, { source: { branch: "main", path: "/" } }, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });

      const siteLink = `https://${GITHUB_USER}.github.io/${projectName}`;
      res.json({text: `🌐 **تم يا ملك!**\n\n**رابط الموقع:**\n${siteLink}\n\nاستنى دقيقتين لحد ما يتفعل`});
    }
    else if(mode === 'image') {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
      res.json({text: `🖼️ **تم توليد صورتك 4K**\n\n${imageUrl}`});
    }
    else {
      res.json({text: `👑 الملك: ${prompt}`});
    }
  } catch(err) {
    res.json({text: `❌ خطأ: ${err.response?.data?.message || err.message}`});
  }
});
app.listen(PORT, () => console.log(`👑 مصنع الملك شغال`));