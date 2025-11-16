### Analista de Reportes Financieros (MercadoLibre)

# MELI Analyst Assistant API - LangChain

Un asistente de análisis financiero especializado en reportes de MercadoLibre (MELI) basado en RAG (Retrieval-Augmented Generation) con integración de IA local vía Ollama.

## 🚀 Descripción

Esta API permite a inversores y analistas financieros consultar información específica de reportes financieros de MercadoLibre (MELI) de manera interactiva. Utiliza un modelo de lenguaje local (Ollama) y embeddings para recuperar fragmentos relevantes del documento y generar respuestas precisas basadas únicamente en el contenido del reporte.

## 📋 Características

- **Análisis financiero especializado**: Responde preguntas sobre reportes financieros de MercadoLibre.
- **Sistema RAG (Retrieval-Augmented Generation)**: Recupera información del documento antes de generar la respuesta.
- **Citas de fuentes**: Incluye la página del documento donde se encontró la información.
- **IA local**: Utiliza modelos Ollama para procesamiento de lenguaje natural sin conexión.
- **API REST**: Diseñada para integrarse fácilmente con interfaces web.
- **Soporte de CORS**: Configurada para permitir conexiones desde `http://localhost:5173`.

## 🛠️ Tecnologías utilizadas

- **Python 3.10+**
- **FastAPI**: Framework web para la API.
- **LangChain**: Integración con modelos de lenguaje y embeddings.
- **Ollama**: Motor de IA local para embeddings y LLM.
- **ChromaDB**: Base de datos vectorial para almacenamiento de embeddings.
- **PyPDF2**: Carga y procesamiento de documentos PDF.
- **FastAPI CORS Middleware**: Gestión de solicitudes entre dominios.

## 📦 Dependencias

```txt
langchain-community
langchain-ollama
langchain-chroma
langchain-text-splitters
fastapi
uvicorn
pydantic
PyPDF2
python-multipart
```

## Documento de entrada

- **Nombre del archivo**: `data/meli_report.pdf`
- **Formato**: PDF
- **Contenido**: Reporte financiero oficial de MercadoLibre

## Modelos utilizados

- **Embeddings**: `embeddinggemma:300m`
- **LLM**: `gpt-oss:20b-cloud`

## Chunking

- **Tamaño del fragmento**: 3000 caracteres
- **Superposición**: 100 caracteres

## Endpoints

### `POST /chat`

Envía una pregunta sobre el reporte financiero y recibe una respuesta con fuentes.

**Request**:

```json
{
  "query": "¿Cuál fue el crecimiento de ingresos en el último trimestre?"
}
```

**Response**

```json
{
  "answer": "El crecimiento de ingresos fue del 25% en el último trimestre...",
  "sources": [
    {
      "text": "Los ingresos aumentaron un 25% en comparación con el año anterior...",
      "page": 12
    }
  ]
}
```

### Demostración del Asistente RAG

![Demo del asistente](demoIA.gif)
