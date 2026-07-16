from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os

app = FastAPI()

# اسمح للواجهة تكلم السيرفر
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # اسمح لكل المواقع
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# حط المفاتيح من Environment Variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

@app.get("/")
def read_root():
    return {"status": "ShadowKing AI Server is Running 👑"}

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message")
    
    if not user_message:
        return JSONResponse(status_code=400, content={"error": "No message provided"})
    
    try:
        response = model.generate_content(user_message)
        return {"reply": response.text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})