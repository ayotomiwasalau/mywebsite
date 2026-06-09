![](/images/project/building-chatpdfdoc-rag-fastapi-chromadb/rag-interface.png)

ChatPDFDoc is a **Retrieval-Augmented Generation (RAG)** assistant: upload PDFs, ask questions in natural language, and get answers grounded in your documents. It uses **gpt-4o-mini**, **ChromaDB**, and **OpenAI embeddings**, is open source, free to use, and runs locally or on the hosted demo.

[Live app](https://chatpdfdoc-46sy.onrender.com) · [GitHub — chatpdfdoc](https://github.com/ayotomiwasalau/chatpdfdoc) ·
[Design rationale (blog)](/work/blogs/pdf-data-answering-rag)

**Why use this build:** efficient chunk retrieval instead of whole-file prompts; no login; upload and delete when you want; automatic data clear after 45 minutes idle.

## Context

Teams and individuals need to query PDF content without pasting entire files into a chat model on every question. A credible RAG MVP had to ingest PDFs, index chunks for similarity search, retrieve relevant passages before calling the LLM, and expose a simple **upload → query → delete** flow with no login friction.

## Approach

The build keeps retrieval, embedding, and generation in one FastAPI process today—upload and query routes delegate to pipeline and query modules in four steps:

1. **FastAPI** routes uploads and queries to pipeline and query modules.
2. **Pipeline** extracts text, chunks documents, embeds with OpenAI, and writes vectors to **ChromaDB**.
3. **Query** runs similarity search, augments the prompt, and calls **gpt-4o-mini**.
4. **Session hygiene** — data auto-clears after **45 minutes** of inactivity; users can delete indexed documents anytime.

![](/images/project/building-chatpdfdoc-rag-fastapi-chromadb/rag-currimpl.jpg)

One FastAPI process runs the API, pipeline, and query modules today. Module layout and production scaling paths are documented in the [architecture blog](/work/blogs/pdf-data-answering-rag).

![](/images/project/building-chatpdfdoc-rag-fastapi-chromadb/rag-code-arch.jpg)

## API surface

The hosted [API docs](https://chatpdfdoc-46sy.onrender.com/docs) mirror what the UI calls—document lifecycle and RAG query endpoints with no separate auth layer.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Home / welcome |
| GET | `/add-document` | Manual or test document add |
| POST | `/api/v1/upload` | Upload and index a PDF |
| POST | `/api/v1/query` | RAG query with retrieved context |
| DELETE | `/api/v1/delete` | Remove an indexed document |
| GET | `/health` | Health check |

![](/images/project/building-chatpdfdoc-rag-fastapi-chromadb/rag-api-doc.png)

## Run locally

```bash
git clone https://github.com/ayotomiwasalau/chatpdfdoc.git && cd chatpdfdoc
python3 -m venv .ragenv && source .ragenv/bin/activate
export OPENAI_API_KEY="your_key"
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirement.txt
python main.py   # or: python -m uvicorn main:app --reload
python -m pytest
```

## Tech stack

FastAPI and ChromaDB keep the MVP deployable on a single host; OpenAI handles embeddings and generation; pytest and GitHub Actions guard regressions before Render deploys.

| Layer | Tools |
|---|---|
| API | FastAPI, Uvicorn |
| Vector store | ChromaDB |
| Embeddings & LLM | OpenAI (gpt-4o-mini) |
| Quality | pytest, GitHub Actions CI/CD |
| Frontend | JavaScript UI |

## Impact

Beyond a demo chat UI, the project shows a minimal RAG loop—chunk, embed, retrieve, generate—with session hygiene and tests suitable for iterative product work.

- **Grounded Q&A** from uploaded PDFs, not unconstrained generation
- **Privacy-friendly** — no account; upload, query, and delete on demand
- **Tested and deployable** — unit tests and CI/CD for reliable updates

## Links

Live app, API docs, and architecture scaling notes live at the links below; the blog owns production split-service design.

- [GitHub — chatpdfdoc](https://github.com/ayotomiwasalau/chatpdfdoc)
- [Live app](https://chatpdfdoc-46sy.onrender.com)
- [API docs](https://chatpdfdoc-46sy.onrender.com/docs)
- [Blog — architecture and scaling design](/work/blogs/pdf-data-answering-rag)
