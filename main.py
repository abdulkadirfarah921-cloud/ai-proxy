from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, requests, base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USER = "abdulkadirfarah921-cloud"

class Message(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "👑 Shadowking AI شغال"}

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

    projectName = prompt.replace(" ", "-")[:30].lower()

    if mode == 'website':
        htmlCode = f"""<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>{prompt}</title><style>body{{background:#000;color:#FFD700;text-align:center;padding:100px}}h1{{font-size:50px}}</style></head><body><h1>👑 {prompt}</h1></body></html>"""

        headers = {'Authorization': f'token {GITHUB_TOKEN}'}
        requests.post(f'https://api.github.com/user/repos', json={'name': projectName}, headers=headers)
        requests.put(f'https://api.github.com/repos/{GITHUB_USER}/{projectName}/contents/index.html',
            json={'message': 'AI', 'content': base64.b64encode(htmlCode.encode()).decode()}, headers=headers)

        siteLink = f'https://{GITHUB_USER}.github.io/{projectName}'
        return {"reply": f"🌐 تم يا ملك!\nالرابط: {siteLink}"}

    else:
        return {"reply": f"👑 الملك يقول: {prompt}"}