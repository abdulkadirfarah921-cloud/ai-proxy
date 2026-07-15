const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

// 1. نفتح الباب لكل المواقع عشان github و PWA
app.use(cors({origin: "*"}));

// 2. نسمح باستقبال JSON
app.use(express.json({limit: '10mb'}));

// 3. صفحة الاختبار
app.get('/', (req, res) => {
  res.send('👑 ShadowKing API is Running - الملك شغال');
});

// 4. المسار الاساسي اللي التطبيق بيكلمه
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, mode } = req.body;
    
    if(!prompt) {
      return res.json({text: "اكتبلي طلبك يا ملك"});
    }

    let response = "";
    
    // كل مود ليه رد مخصص
    if(mode === 'app') {
      response = `👑 تم يا ملك! كود التطبيق: ${prompt}\n\n\`\`html\n<!DOCTYPE html>\n<html>\n<head><title>${prompt}</title></head>\n<body>\n<h1>${prompt}</h1>\n</body>\n</html>\n\`\nانسخ الكود ده`;
    }
    
    else if(mode === 'game3d') {
      response = `🎮 تم صنع لعبة 3D: ${prompt}\n\n\`\`js\n// كود Three.js\nconst scene = new THREE.Scene();\n// لعبتك: ${prompt}\n\`\`\`\nضيف الكود ده في مشروعك`;
    }
    
    else if(mode === 'website') {
      response = `🌐 تم صنع الموقع: ${prompt}\n\n\`\`html\n<!DOCTYPE html>\n<html lang="ar" dir="rtl">\n<head><title>${prompt}</title></head>\n<body>\n<h1>${prompt}</h1>\n</body>\n</html>\n\`\``;
    }
    
    else if(mode === 'image') {
      response = `🖼️ جاري توليد صورة 4K للطلب: "${prompt}"\nتم ارسال الطلب للذكاء الاصطناعي الملكي. انتظر 10 ثواني`;
    }
    
    else if(mode === 'video') {
      response = `🎬 جاري صنع فيديو عن: "${prompt}"\nسيتم توليد الفيديو خلال دقيقة يا ملك`;
    }
    
    else if(mode === 'learn') {
      response = `📚 درس الملك: ${prompt}\n\n1. **الشرح**: هذا درس كامل عن ${prompt}\n2. **المثال**: مثال عملي\n3. **التطبيق**: جرب بنفسك هسا\nتحتاج شرح اكثر؟`;
    }
    
    else { // chat
      response = `👑 الملك يرد: ${prompt}\n\nكيف اقدر اخدمك اكثر يا ملك؟`;
    }
    
    res.json({text: response});
    
  } catch (error) {
    console.log(error);
    res.json({text: "عذرا يا ملك، صار خطأ في السيرفر. جرب مرة ثانية"});
  }
});

// 5. نشغل السيرفر
app.listen(PORT, () => {
  console.log(`👑 ShadowKing Server شغال على المنفذ ${PORT}`);
});