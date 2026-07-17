from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import requests
import base64
import time

app = FastAPI(title="Shadowking AI Factory")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# بنجيب التوكن من Render مش من الكود
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USER = "abdulkadirfarah921-cloud"

class Message(BaseModel):
    message: str

class AudioRequest(BaseModel):
    prompt: str

@app.get("/health")
def health():
    return "OK"

@app.post("/api/chat")
async def chat(data: Message):
    message = data.message
    mode = 'chat'
    prompt = message

    if message.startswith('[app]'):
        mode = 'website'
        prompt = message.replace('[app]', '').strip()
    if message.startswith('[game]'):
        mode = 'game'
        prompt = message.replace('[game]', '').strip()

    projectName = prompt.replace(" ", "-")[:25].lower()

    if mode in ['website', 'game'] and not GITHUB_TOKEN:
        return {"reply": "❌ خطأ: GITHUB_TOKEN مش موجود في Render"}

    try:
        headers = {'Authorization': f'token {GITHUB_TOKEN}'}

        if mode == 'website':
            html = f"""<!DOCTYPE html>
<html lang='ar' dir='rtl'>
<head>
    <meta charset="UTF-8">
    <title>{prompt}</title>
    <style>
        body {{ background:#000; color:#FFD700; text-align:center; padding:100px; font-family:Arial; }}
        h1 {{ font-size:40px; }}
    </style>
</head>
<body>
    <h1>👑 {prompt}</h1>
    <p>تم صنعه بواسطة Shadowking AI</p>
</body>
</html>"""
            
            # انشاء الريبو
            requests.post('https://api.github.com/user/repos', json={'name': projectName}, headers=headers)
            
            # رفع index.html
            content = base64.b64encode(html.encode('utf-8')).decode('utf-8')
            requests.put(f'https://api.github.com/repos/{GITHUB_USER}/{projectName}/contents/index.html', 
                        json={'message': 'AI Generated', 'content': content}, headers=headers)
            
            return {"reply": f"🌐 تم انشاء الموقع بنجاح: https://{GITHUB_USER}.github.io/{projectName}"}

        elif mode == 'game':
            return {"reply": "🎮 تم انشاء اللعبة بنجاح"}
        else:
            return {"reply": f"👑 امر ملكي: {prompt}"}

    except Exception as e:
        return {"reply": f"❌ خطأ: {str(e)}"}

@app.post("/api/generate-audio")
async def generate_audio(data: AudioRequest):
    time.sleep(3)
    return {"reply": "✅ تم انشاء الصوت", "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}