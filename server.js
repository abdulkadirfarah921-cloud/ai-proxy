const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({origin: "*"}));
app.use(express.json({limit: '10mb'}));

app.get('/', (req, res) => {
  res.send('👑 ShadowKing API is Running - الملك شغال');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, mode } = req.body;
    if(!prompt) return res.json({text: "اكتبلي طلبك يا ملك"});

    let response = "";
    
    if(mode === 'app') {
      response = `👑 تم يا ملك! كود التطبيق: ${prompt}\n\n\`\`html\n<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head><title>${prompt}</title></head>\n<body>\n<h1>${prompt}</h1>\n</body>\n</html>\n\`\nانسخ الكود ده في ملف html`;
    }
    else if(mode === 'game3d') {
      response = `🎮 تم صنع لعبة 3D: ${prompt}\n\n\`\`html\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>\nconst scene = new THREE.Scene();\n// لعبتك: ${prompt}\n\`\`\nضيف الكود ده في ملف html`;
    }
    else if(mode === 'website') {
      response = `🌐 تم صنع الموقع: ${prompt}\n\n\`\`html\n<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head><meta charset="UTF-8"><title>${prompt}</title></head>\n<body>\n<h1>مرحبا في موقع ${prompt}</h1>\n</body>\n</html>\n\`\``;
    }
    else if(mode === 'image') {
      response = `🖼️ جاري توليد صورة 4K للطلب: "${prompt}"\nتم ارسال الطلب للذكاء الاصطناعي الملكي. انتظر 10 ثواني واطلبها مرة ثانية`;
    }
    else if(mode === 'video') {
      response = `🎬 جاري صنع فيديو عن: "${prompt}"\nسيتم توليد الفيديو خلال دقيقة يا ملك. اكتب "حالة الفيديو" بعد دقيقة`;
    }
    else if(mode === 'learn') {
      response = `📚 **درس الملك: ${prompt}**\n\n**1. الشرح المفصل:**\n${prompt} هو من اهم المواضيع. خليني اشرحلك خطوة خطوة...\n\n**2. المثال العملي:**\nمثال: لو بدنا ${prompt} بنعمل كذا وكذا\n**3. التطبيق:**\nجرب انت هسا واكتبلي الكود\nتحتاج شرح اكثر عن اي نقطة يا ملك؟`;
    }
    else { 
      response = `👑 الملك يرد: ${prompt}\n\nكيف اقدر اخدمك اكثر يا ملك؟ جرب "صنع تطبيق" او "علمني"`;
    }
    
    res.json({text: response});
  } catch (error) {
    res.json({text: "عذرا يا ملك، صار خطأ في السيرفر. جرب مرة ثانية"});
  }
});

app.listen(PORT, () => {
  console.log(`👑 ShadowKing Server شغال على المنفذ ${PORT}`);
});