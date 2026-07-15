from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

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
    
    reply = f"👑 الملك: استلمت '{prompt}'. انا في وضع {mode}. جاري التنفيذ..."
    
    return {"text": reply}