from fastapi import FastAPI
from pydantic import BaseModel
from rag_chain import query_rag
from typing import List
from fastapi.middleware.cors import CORSMiddleware  # 👈 Agrega esta línea

app = FastAPI(title="MELI Analyst Assistant API - LangChain")

# ✅ Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ⚠️ Puerto de tu frontend
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los headers
)

class ChatRequest(BaseModel):
    query: str

class Source(BaseModel):
    text: str
    page: int

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    result = query_rag(request.query)
    return ChatResponse(**result)

@app.get("/health")
def health():
    return {"status": "ok"}