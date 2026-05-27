![](/images/blog/chatpdfdoc-a-data-answering-rag/architecture.jpg)

## System Overview

ChatPDFDoc lets users **upload PDFs and ask questions in natural language** with answers grounded in document content — not generic LLM guesses. The system ingests files, chunks and embeds text in a vector store, retrieves relevant passages on each query, and augments an OpenAI call before returning a response. A FastAPI backend exposes upload, query, and delete endpoints; data auto-clears after 45 minutes of inactivity.

Live: [chatpdfdoc-46sy.onrender.com](https://chatpdfdoc-46sy.onrender.com)

## Component Breakdown

- **FastAPI** — REST API for upload, RAG query, delete, and health checks
- **Pipeline service** — PDF text extraction, chunking, and embedding writes to the vector store
- **ChromaDB** — local vector database for similarity search over document chunks
- **OpenAI** — embeddings for indexing; **gpt-4o-mini** for augmented generation
- **Query service** — retrieves top-k chunks, builds the prompt, calls the LLM
- **Frontend + CI** — JavaScript UI, pytest suite, GitHub Actions deployment

## Design Decisions

**RAG over raw LLM** — sending full PDFs on every question is expensive and noisy; retrieval keeps context small and relevant.

**ChromaDB for MVP** — lightweight, embeddable, and sufficient for single-tenant document Q&A without managed vector DB cost.

**Monolithic MVP** — one server runs API, pipeline, and query modules with clear separation so each layer can be swapped later.

**No login required** — lowers friction for demos; session TTL limits data retention risk.

**Dependency inversion** — vector store and LLM providers are abstracted so OpenAI or Chroma can be replaced without rewriting the API layer.

## Trade-offs

| Pros | Cons |
|---|---|
| Grounded, citation-friendly answers | OpenAI API cost per query |
| Privacy-friendly upload/delete flow | Chroma is not multi-tenant production scale out of the box |
| Fast to deploy and demo | PDF parsing quality varies by layout |
| Documented path to production RAG | Monolith limits independent scaling today |

## Scaling Considerations

For production volume: store raw PDFs in **S3**, run batch ingestion via **Airflow/Spark**, use a **managed or distributed vector DB**, add a **metadata store** (Postgres), and front the API with multiple FastAPI instances behind a load balancer. Cache hot queries, partition by tenant, and add **Prometheus/Grafana** or CloudWatch for observability.

## Link

[View Project Case Study](/work/projects/building-chatpdfdoc-rag-fastapi-chromadb)
