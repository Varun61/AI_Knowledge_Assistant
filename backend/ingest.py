from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from rank_bm25 import BM25Okapi
from loaders.pdf_loader import load_pdf
from loaders.email_loader import load_eml
from loaders.image_loader import load_image
import pickle
import os

DB_PATH = "db"


def load_documents(file_path: str):
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return load_pdf(file_path)

    elif ext == ".eml":
        text = load_eml(file_path)
        return [Document(page_content=text, metadata={"source": os.path.basename(file_path)})]

    elif ext in (".png", ".jpg", ".jpeg", ".tiff", ".bmp"):
        text = load_image(file_path)
        return [Document(page_content=text, metadata={"source": os.path.basename(file_path)})]

    else:
        raise ValueError(f"Unsupported file type: {ext}")


def ingest_pdf(file_path: str):
    documents = load_documents(file_path)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = splitter.split_documents(documents)

    for chunk in chunks:
        chunk.metadata["source"] = os.path.basename(file_path)

    texts = [doc.page_content for doc in chunks]
    tokenized_texts = [text.lower().split() for text in texts]
    bm25 = BM25Okapi(tokenized_texts)

    with open("bm25.pkl", "wb") as f:
        pickle.dump((bm25, texts, chunks), f)

    embeddings = OllamaEmbeddings(model="nomic-embed-text")

    if os.path.exists(DB_PATH):
        db = FAISS.load_local(
            DB_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )
        db.add_documents(chunks)
    else:
        db = FAISS.from_documents(chunks, embeddings)

    db.save_local(DB_PATH)

    return "Ingestion complete"