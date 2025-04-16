from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import requests
import base64
import os

app = FastAPI()

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = "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"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

# Helper to convert image to base64
def image_to_base64(image_file):
    return base64.b64encode(image_file.read()).decode("utf-8")

@app.post("/chat")
async def chat(image: Optional[UploadFile] = File(None), text: Optional[str] = Form(None)):
    messages = []

    if image:
        base64_image = image_to_base64(image.file)
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": "Give me brief information about this image."},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:{image.content_type};base64,{base64_image}"
                    }
                }
            ]
        })
    elif text:
        messages.append({
            "role": "user",
            "content": [{"type": "text", "text": text}]
        })
    else:
        return {"response": "No input provided."}

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.7,
    }

    response = requests.post(GROQ_API_URL, json=body, headers=headers)

    if response.status_code == 200:
        result = response.json()
        return {"response": result['choices'][0]['message']['content']}
    else:
        return {"response": "Failed to get response from Groq API."}
