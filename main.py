from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import google.generativeai as genai

app = FastAPI()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "ShadowKing AI Server is Running 👑"}

@app.post("/api/chat")
async def chat(req: Request):
    data = await req.json()
    prompt = data.get("prompt")
    mode = data.get("mode")
    response = model.generate_content(f"انت مساعد ذكي اسمك ShadowKing. الرد بلهجة ملكية. الوضع: {mode}. السؤال: {prompt}")
    return {"text": f"👑 {response.text}"}