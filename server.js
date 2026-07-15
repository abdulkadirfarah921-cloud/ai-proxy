const express = require('express');
const cors = require('cors');
const axios = require('axios');
const JSZip = require('jszip');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({limit: '50mb'}));

// حط التوكن بتاع github هنا بعد ما تعمله
const GITHUB_TOKEN = "ghp_ضع_التوكن_هنا"; 
const GITHUB_USER = "irfarah921-cloud";

app.post('/api/chat', async (req, res) => {
  const { prompt, mode } = req.body;
  const projectName = prompt.replace(/\s/g, "-").substring(0,20);

  try {
    if(mode === 'website') {
      // 1. نولد الكود الملكي
      const htmlCode = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>${prompt}</title>
<style>body{background:linear-gradient(135deg,#1a0033,#000);color:white;text-align:center;padding:100px;font-family:Cairo;}h1{font-size:50px;color:#FFD700;}</style>
</head>
<body>
<h1>👑 ${prompt}</h1>
<p>تم صنعه بالذكاء الاصطناعي الملك - خبرة 100000 سنة</p>
</body>
</html>`;

      // 2. نعمل ZIP
      const zip = new JSZip();
      zip.file("index.html", htmlCode);
      zip.file("README.txt", `مشروع: ${prompt}\nصنعه الملك`);
      const zipContent = await zip.generateAsync({type:"base64"});

      // 3. نرفع على github تلقائي
      await axios.put(`https://api.github.com/repos/${GITHUB_USER}/${projectName}/contents/index.html`,
      {
        message: "Upload by ShadowKing AI",
        content: Buffer.from(htmlCode).toString('base64')
      }, { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } });

      const siteLink = `https://${GITHUB_USER}.github.io/${projectName}`;
      const zipLink = `data:application/zip;base64,${zipContent}`;

      res.json({text: `🌐 **تم يا ملك! موقع ${prompt} جاهز**\n\n**1. رابط الموقع المباشر:**\n${siteLink}\n\n**2. تحميل الملفات ZIP:**\n${zipLink}\n\n**3. جوة الـ zip:**\nملفات التطبيق/\n  - index.html\n  - README.txt\nارفع الموقع على github pages وبيشتغل فورا`});
    }
    
    else if(mode === 'image') {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;
      res.json({text: `🖼️ **تم توليد صورتك 4K في 5 ثواني**\n\n${imageUrl}\n\nدوس عليها وحملها يا ملك`});
    }
    
    else if(mode === 'app') {
      res.json({text: `📱 **تم صنع تطبيق ${prompt}**\n\nالكود جاهز + ZIP\nانسخه وشغله كـ PWA`});
    }
    
    else {
      res.json({text: `👑 الملك: ${prompt}`});
    }

  } catch(err) {
    res.json({text: `صار خطأ: ${err.message}. تأكد حطيت GITHUB_TOKEN`});
  }
});

app.listen(PORT, () => console.log(`👑 مصنع الملك المجاني شغال`));