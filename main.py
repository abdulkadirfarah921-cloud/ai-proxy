from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, requests, base64, time

app = FastAPI(title="Shadowking AI Factory")

# اهم سطر عشان github + chat.html يشتغلو مع render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USER = "abdulkadirfarah921-cloud"

class Message(BaseModel):
    message: str

class AudioRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"status": "👑 ShadowKing AI Server is Running"}

@app.get("/health")
def health():
    return "OK"

# 1. الشات العادي + صنع موقع + صنع لعبة
@app.post("/api/chat")
async def chat(data: Message):
    message = data.message
    mode = 'chat'
    prompt = message

    if message.startswith('[app]'):
        mode = 'website'
        prompt = message.replace('[app]', '').strip()
    elif message.startswith('[game]'):
        mode = 'game'
        prompt = message.replace('[game]', '').strip()
    elif message.startswith('[audio]'):
        mode = 'audio'
        prompt = message.replace('[audio]', '').strip()

    projectName = prompt.replace(" ", "-")[:30].lower()

    if not GITHUB_TOKEN and mode in ['website', 'game']:
        return {"reply": "❌ خطأ: GITHUB_TOKEN مش موجود في Render"}

    try:
        if mode == 'website':
            htmlCode = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>{prompt}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700&display=swap" rel="stylesheet">
<style>
body{{background:linear-gradient(135deg,#1a0033,#000);color:#FFD700;text-align:center;padding:100px 20px;font-family:Cairo;margin:0;}}
h1{{font-size:50px;text-shadow:0 0 20px #FFD700;}}
p{{font-size:20px;}}
</style>
</head>
<body>
<h1>👑 {prompt}</h1>
<p>تم صنعه بواسطة Shadowking AI</p>
</body>
</html>"""

            headers = {'Authorization': f'token {GITHUB_TOKEN}'}
            requests.post(f'https://api.github.com/user/repos', json={'name': projectName, 'private': False}, headers=headers)
            requests.put(f'https://api.github.com/repos/{GITHUB_USER}/{projectName}/contents/index.html',
                json={'message': 'Created by ShadowKing AI', 'content': base64.b64encode(htmlCode.encode()).decode()}, headers=headers)

            siteLink = f'https://{GITHUB_USER}.github.io/{projectName}'
            return {"reply": f"🌐 **تم يا ملك! صنعنا موقعك**\n\n**الرابط:**\n{siteLink}\n\nاستنى دقيقتين لحد ما يتفعل على github pages"}

        elif mode == 'game':
            gameCode = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>{prompt}</title>
<style>body{{background:#000;color:#FFD700;text-align:center;font-family:Cairo;padding:50px;}}</style>
</head>
<body>
<h1>🎮 {prompt}</h1>
<p>تم صنع اللعبة بواسطة Shadowking AI</p>
</body></html>"""
            headers = {'Authorization': f'token {GITHUB_TOKEN}'}
            requests.post(f'https://api.github.com/user/repos', json={'name': projectName, 'private': False}, headers=headers)
            requests.put(f'https://api.github.com/repos/{GITHUB_USER}/{projectName}/contents/index.html',
                json={'message': 'Game by ShadowKing AI', 'content': base64.b64encode(gameCode.encode()).decode()}, headers=headers)

            siteLink = f'https://{GITHUB_USER}.github.io/{projectName}'
            return {"reply": f"🎮 **تم صنع اللعبة**\n\n**العبها من هنا:**\n{siteLink}"}

        elif mode == 'audio':
            return {"reply": f"🎵 لصنع الصوت استخدم صفحة هندسة الصوت في الواجهة\n\nالوصف: {prompt}"}
        else:
            return {"reply": f"👑 الملك Shadowking يقول:\n{prompt}\n\nكيف بقدر اساعدك اكثر؟\n\nاكتب 'هندسة صوت' عشان تفتح استوديو الصوت"}

    except Exception as e:
        return {"reply": f"❌ خطأ: {str(e)}"}

# 2. صنع صوت بالذكاء الاصطناعي - بياخد 5 دقايق
@app.post("/api/generate-audio")
async def generate_audio(data: AudioRequest):
    prompt = data.prompt

    if not prompt:
        return {"reply": "❌ اكتب وصف الصوت"}

    # محاكاة انه بيصنع 5 دقايق
    time.sleep(2) # شيل ده لو عندك API حقي

    # لو عندك API زي ElevenLabs حطه هنا
    # مثال: audio_url = call_elevenlabs_api(prompt)

    # مؤقتا هنرجع صوت تجريبي لحد ما تربط API
    demo_audio_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

    return {
        "reply": f"✅ تم صنع الصوت: {prompt}",
        "audioUrl": demo_audio_url,
        "duration": "00:30"
    }