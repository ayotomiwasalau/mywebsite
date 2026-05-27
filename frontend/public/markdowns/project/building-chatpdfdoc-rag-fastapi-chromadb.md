![](/images/project/building-chatpdfdoc-rag-fastapi-chromadb/rag-interface.png)

Teams need to **query PDF documents with natural language** without sending entire files to an LLM on every request. ChatPDFDoc is a **Retrieval-Augmented Generation (RAG)** assistant that ingests PDFs, indexes chunks in a vector store, and answers questions with grounded context.

## Problem

Generic chatbots hallucinate on domain documents. A document Q&A system had to:

- **Ingest PDFs**, chunk text, and embed for similarity search
- **Retrieve relevant passages** before calling the LLM
- Expose a simple **upload → query → delete** lifecycle with no login friction
- Ship as a deployable API with tests and CI/CD

## Solution

End-to-end RAG stack ([GitHub — chatpdfdoc](https://github.com/ayotomiwasalau/chatpdfdoc), [live demo](https://chatpdfdoc-46sy.onrender.com)):

1. **FastAPI** receives uploads and queries; routes to pipeline and LLM modules
2. **Pipeline service** extracts text, chunks documents, and stores **OpenAI embeddings** in **ChromaDB**
3. **Query service** runs similarity search, augments the prompt, and calls **gpt-4o-mini**
4. **Session hygiene** — data auto-clears after 45 minutes of inactivity

![](/images/project/building-chatpdfdoc-rag-fastapi-chromadb/rag-currimpl.jpg)

## Architecture breakdown

### MVP (monolith)

Single server runs API, ingestion pipeline, and query path. Modules follow **single responsibility** with dependency inversion so vector store or LLM providers can be swapped.

![](/images/project/building-chatpdfdoc-rag-fastapi-chromadb/rag-code-arch.jpg)

### Key endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/v1/upload` | Index a PDF |
| POST | `/api/v1/query` | RAG query with retrieved chunks |
| DELETE | `/api/v1/delete` | Remove indexed document |
| GET | `/health` | Health check |

![](/images/project/building-chatpdfdoc-rag-fastapi-chromadb/rag-api-doc.png)

### Production path (design notes)

Decouple into object storage (S3) for raw files, Airflow/Spark for batch ingestion, distributed Chroma or managed vector DB, metadata store, and observability (Prometheus/Grafana or CloudWatch).

## Tech stack

| Layer | Tools |
|---|---|
| API | FastAPI, Uvicorn |
| Vector store | ChromaDB |
| Embeddings & LLM | OpenAI |
| Quality | pytest, GitHub Actions CI/CD |
| Frontend | JavaScript UI (bundled in repo) |

## Impact

- **Grounded answers** from uploaded PDFs instead of unconstrained generation
- **Privacy-friendly** — no account required; users control upload/delete
- **Extensible architecture** documented for scaling to production RAG patterns

## Links

- [GitHub — chatpdfdoc](https://github.com/ayotomiwasalau/chatpdfdoc)
- [Live app](https://chatpdfdoc-46sy.onrender.com)
- [API docs](https://chatpdfdoc-46sy.onrender.com/docs)
- [Blog — ChatPDFDoc RAG walkthrough](/posts/chatpdfdoc-a-data-answering-rag)
