const express = require('express');
const cors = require('cors');
const axios = require('axios');
const JSZip = require('jszip');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({limit: '50mb'}));

// المتغيرات السرية حطها في Render > Environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = "abdulkadirfarah921-cloud";

app.get('/', (req, res) => {
  res.send('👑 Shadowking AI Server شغال');
});

// 1. دي عشان المصحي كل 5 دقايق
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body; // الواجهة بتبعت message
  if(!message) return res.json({reply: "فين الرسالة يا ملك؟"});

  // نطلع المود من اول الرسالة [app] او [game]
  let mode = 'chat';
  let prompt = message;
  if(message.startsWith('[app]')) { mode = 'website'; prompt = message.replace('[app]', '').trim(); }
  if(message.startsWith('[game]')) { mode = 'game'; prompt = message.replace('[game]', '').trim(); }
  if(message.startsWith('[chat]')) { mode = 'chat'; prompt = message.replace('[chat]', '').trim(); }

  const projectName = prompt.replace(/\s/g, "-").substring(0,25).toLowerCase();

  try {
    if(mode === 'website') {
      const htmlCode = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${prompt}</title><style>body{background:linear-gradient(135deg,#1a0033,#000);color:white;text-align:center;padding:100px 20px;font-family:Cairo;margin:0;}h1{font-size:50px;color:#FFD700;text-shadow:0 0 20px #FFD700;}</style></head><body><h1>👑 ${prompt}</h1><p>تم صنعه بالذكاء الاصطناعي الملك Shadowking AI</p></body></html>`;

      console.log("بصنع مستودع:", projectName);
      await axios.post(`https://api.github.com/user/repos`, { name: projectName, auto_init: true, private: false }, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });

      console.log("برفع index.html");
      await axios.put(`https://api.github.com/repos/${GITHUB_USER}/${projectName}/contents/index.html`, { message: "Created by ShadowKing AI", content: Buffer.from(htmlCode).toString('base64') }, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });

      console.log("بفعل Github Pages");
      await axios.post(`https://api.github.com/repos/${GITHUB_USER}/${projectName}/pages`, { source: { branch: "main", path: "/" } }, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });

      const siteLink = `https://${GITHUB_USER}.github.io/${projectName}`;
      res.json({reply: `🌐 **تم يا ملك! صنعنا موقعك**\n\n**رابط الموقع:**\n${siteLink}\n\nاستنى دقيقتين لحد ما يتفعل`});
    }
    else if(mode === 'image') {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
      res.json({reply: `🖼️ **تم توليد صورتك 4K**\n\n${imageUrl}`});
    }
    else if(mode === 'game') {
      const gameCode = `<!DOCTYPE html><html><head><title>${prompt}</title><style>body{background:#000;color:#FFD700;text-align:center;padding:50px}canvas{border:2px solid #FFD700}</style></head><body><h1>${prompt}</h1><canvas id="game" width="400" height="400"></canvas><script>const c=document.getElementById('game').getContext('2d');c.fillText('اللعبة: ${prompt}', 100, 200);</script></body></html>`;
      res.json({reply: `🎮 **تم صنع اللعبة**\n\nانسخ الكود ده في ملف index.html:\n\n\`\`\`html\n${gameCode}\n\`\`\``});
    }
    else { // chat
      const answers = [
        `👑 الملك يقول: ${prompt}`,
        `فهمت عليك. طلبك: ${prompt}`,
        `Shadowking AI جاهز لخدمتك: ${prompt}`
      ];
      res.json({reply: answers[Math.floor(Math.random()*answers.length)]});
    }
  } catch(err) {
    console.error(err.response?.data || err.message);
    res.json({reply: `❌ خطأ: ${err.response?.data?.message || err.message}\nتأكد ان GITHUB_TOKEN شغال`});
  }
});

app.listen(PORT, () => console.log(`👑 مصنع الملك شغال على بورت ${PORT}`));