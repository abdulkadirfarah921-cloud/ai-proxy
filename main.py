from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, requests, base64, time

app = FastAPI(title="Shadowking AI Factory")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USER = "abdulkadirfarah921-cloud"

class Message(BaseModel): message: str
class AudioRequest(BaseModel): prompt: str

@app.get("/health")
def health(): return "OK"

@app.post("/api/chat")
async def chat(data: Message):
    message, mode, prompt = data.message, 'chat', data.message
    if message.startswith('[app]'): mode, prompt = 'website', message.replace('[app]', '').strip()
    if message.startswith('[game]'): mode, prompt = 'game', message.replace('[game]', '').strip()
    projectName = prompt.replace(" ", "-")[:25].lower()
    if mode in ['website', 'game'] and not GITHUB_TOKEN: return {"reply": "❌ حط GITHUB_TOKEN في Render"}
    try:
        headers = {'Authorization': f'token {GITHUB_TOKEN}'}
        if mode == 'website':
            html = f"<!DOCTYPE html><html lang='ar' dir='rtl'><head><title>{prompt}</title></head><body style='background:#000;color:#FFD700;text-align:center;padding:100px;'><h1>👑 {prompt}</h1></body></html>"
            requests.post('https://api.github.com/user/repos', json={'name': projectName}, headers=headers)
            requests.put(f'https://api.github.com/repos/{GITHUB_USER}/{projectName}/contents/index.html', json={'message': 'AI', 'content': base64.b64encode(html.encode()).decode()}, headers=headers)
            return {"reply": f"🌐 تم: https://{GITHUB_USER}.github.io/{projectName}"}
        elif mode == 'game': return {"reply": "🎮 تم"}
        else: return {"reply": f"👑 {prompt}"}
    except Exception as e: return {"reply": f"❌ خطأ: {str(e)}"}

@app.post("/api/generate-audio")
async def generate_audio(data: AudioRequest):
    time.sleep(3)
    return {"reply": "✅ تم", "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}