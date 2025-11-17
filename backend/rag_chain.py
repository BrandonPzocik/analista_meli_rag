from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from typing import List, Dict, Any

# Parámetros
PDF_PATH = "data/meli_report.pdf"
COLLECTION_NAME = "meli_financial_docs"
EMBEDDING_MODEL = "embeddinggemma:300m"
LLM_MODEL = "gpt-oss:20b-cloud"  # o "llama3.1:8b" si tienes RAM
CHUNK_SIZE = 3000
CHUNK_OVERLAP = 100

# Inicializar componentes
embedding = OllamaEmbeddings(model=EMBEDDING_MODEL)

# Cargar y dividir documentos
def load_and_split_pdf():
    loader = PyPDFLoader(PDF_PATH)
    pages = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP
    )
    docs = text_splitter.split_documents(pages)
    return docs

# Crear vector store
def create_vector_store(docs):
    vector_store = Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embedding,
        persist_directory="./vectorstore"
    )
    vector_store.add_documents(docs)
    return vector_store

# Inicializar RAG Chain
def get_rag_chain():
    docs = load_and_split_pdf()
    vector_store = create_vector_store(docs)

    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 1}
    )

    # Prompt para el LLM
    prompt = ChatPromptTemplate.from_messages([
    ("system", """Eres un Analista Financiero Junior especializado en reportes financieros de MercadoLibre (MELI).
Tu tarea es responder preguntas de inversores basándote ÚNICAMENTE en el contexto extraído del reporte oficial.

Sigue estas reglas:
NO HAGAS TABLAS EN TUS RESPUESTAS.
RESPONDE SIEMPRE EN ESPAÑOL.
1. Usa solo la información del contexto.
2. Si el contexto contiene información parcial o indirecta, infiere razonablemente sin inventar datos.
3. Cita siempre la página del documento cuando sea posible.
4. Si realmente NO hay información relevante, responde: "No se encontró información sobre eso en el reporte" y no cites nada.
Formatea tu respuesta en Markdown: usa **negritas**, *cursivas*, listas con `-`, NO HAGAS TABLAS.
"

Contexto:
{context}

Pregunta: {question}

Respuesta:"""),
    ("human", "{question}"),  # Opcional: si quieres que el humano repita la pregunta
])

    llm = ChatOllama(model=LLM_MODEL)

    # Cadena RAG
    from langchain_core.runnables import RunnablePassthrough, RunnableParallel
    from langchain_core.output_parsers import StrOutputParser

    def format_docs(docs):
        return "\n\n".join([f"[Fuente: Página {doc.metadata.get('page', 'N/A')}] {doc.page_content}" for doc in docs])

    rag_chain_from_docs = (
        RunnablePassthrough.assign(context=(lambda x: format_docs(x["context"])))
        | prompt
        | llm
        | StrOutputParser()
    )

    rag_chain_with_source = RunnableParallel(
        {"context": retriever, "question": RunnablePassthrough()}
    ).assign(answer=rag_chain_from_docs)

    return rag_chain_with_source

# Instanciar la cadena
rag_chain = get_rag_chain()

def query_rag(query: str) -> Dict[str, Any]:
    result = rag_chain.invoke(query)
    answer = result["answer"]
    context_docs = result["context"]

    sources = [
        {"text": doc.page_content[:300] + "...", "page": doc.metadata.get("page", 0)}
        for doc in context_docs
    ]

    return {"answer": answer, "sources": sources}