from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import shutil
from ingest import ingest_pdf
from rag import ask_question, chat_with_memory, chat_with_memory_stream
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import os
from typing import Optional, List


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for now (dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    chat_history: list = []
    selected_files: Optional[List[str]] = None

@app.post("/chat/")
def chat(request: ChatRequest):
    print(request.chat_history)

    def generate():
        for chunk in chat_with_memory_stream(request.message, request.chat_history, request.selected_files):
            yield chunk

    return StreamingResponse(generate(), media_type="text/plain")
# @app.post("/chat/")
# def chat(request: ChatRequest):
#     print(request.chat_history)
#     response = chat_with_memory(request.message, request.chat_history)
#     return {"response": response}

# @app.post("/chat/")
# def chat(request: ChatRequest):
#     response = ask_question(request.message)
#     return {"response": response}

UPLOAD_DIR = "data"

EXT_TO_FOLDER = {
    ".pdf": "pdf",
    ".eml": "email",
    ".msg": "email",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".tiff": "image",
    ".bmp": "image",
}

@app.get("/files/")
def list_files():
    files = []
    for subfolder in ["pdf", "image", "email"]:
        folder = os.path.join(UPLOAD_DIR, subfolder)
        if os.path.exists(folder):
            files += [f for f in os.listdir(folder)]
    return {"files": sorted(files)}

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    subfolder = EXT_TO_FOLDER.get(ext, "pdf")
    dest_dir = os.path.join(UPLOAD_DIR, subfolder)
    os.makedirs(dest_dir, exist_ok=True)
    file_path = os.path.join(dest_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    ingest_pdf(file_path)
    return {"message": f"{file.filename} uploaded and indexed successfully"}

#This was used so we can use api's in swagger tool
@app.get("/ask/")
def ask(query: str):
    return {"answer": ask_question(query)}