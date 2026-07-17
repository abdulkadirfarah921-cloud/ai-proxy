from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, requests, base64, time

app = FastAPI(title="Shadowking AI Factory")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# بنسحب التوكن من Render بس. مافي توكن في الكود
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USER = "abdulkadirfarah921-cloud"

class Message(BaseModel):
    message: str

class AudioRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"status": "👑 ShadowKing AI Server is Running on ai-proxy-qnen"}

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
    elif message.startswith('[game]'):
        mode = 'game'
        prompt = message.replace('[game]', '').strip()

    projectName = prompt.replace(" ", "-")[:25].lower()

    if mode in ['website', 'game'] and not GITHUB_TOKEN:
        return {"reply": "❌ خطأ: GITHUB_TOKEN مش موجود في Render > Environment"}

    try:
        headers = {'Authorization': f'token {GITHUB_TOKEN}'} if GITHUB_TOKEN else {}

        if mode == 'website':
            htmlCode = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>{prompt}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700&display=swap" rel="stylesheet">
<style>body{{background:linear-gradient(135deg,#1a0033,#000);color:#FFD700;text-align:center;padding:100px 20px;font-family:Cairo;}}h1{{font-size:50px;text-shadow:0 0 20px #FFD700;}}</style>
</head><body><h1>👑 {prompt}</h1><p>تم صنعه بواسطة Shadowking AI</p></body></html>"""

            requests.post('https://api.github.com/user/repos', json={'name': projectName, 'private': False}, headers=headers)
            requests.put(f'https://api.github.com/repos/{GITHUB_USER}/{projectName}/contents/index.html',
                json={'message': 'Created by ShadowKing AI', 'content': base64.b64encode(htmlCode.encode()).decode()}, headers=headers)

            siteLink = f'https://{GITHUB_USER}.github.io/{projectName}'
            return {"reply": f"🌐 **تم يا ملك!**\n\n**رابط موقعك:**\n{siteLink}\n\nاستنى دقيقتين يتفعل"}

        elif mode == 'game':
            gameCode = f"<!DOCTYPE html><html><head><title>{prompt}</title></head><body style='background:#000;color:#FFD700;text-align:center;padding:50px;font-family:Cairo'><h1>🎮 {prompt}</h1></body></html>"
            requests.post('https://api.github.com/user/repos', json={'name': projectName, 'private': False}, headers=headers)
            requests.put(f'https://api.github.com/repos/{GITHUB_USER}/{projectName}/contents/index.html',
                json={'message': 'Game by ShadowKing AI', 'content': base64.b64encode(gameCode.encode()).decode()}, headers=headers)
            siteLink = f'https://{GITHUB_USER}.github.io/{projectName}'
            return {"reply": f"🎮 **تم صنع اللعبة**\n\n**العبها:**\n{siteLink}"}
        else:
            return {"reply": f"👑 الملك Shadowking يقول:\n{prompt}\n\nاكتب 'هندسة صوت' عشان تفتح الاستوديو"}

    except Exception as e:
        return {"reply": f"❌ خطأ: {str(e)}"}

@app.post("/api/generate-audio")
async def generate_audio(data: AudioRequest):
    prompt = data.prompt
    if not prompt: return {"reply": "❌ اكتب وصف الصوت"}
    time.sleep(3)
    demo_audio_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    return {"reply": f"✅ تم صنع الصوت: {prompt}", "audioUrl": demo_audio_url}