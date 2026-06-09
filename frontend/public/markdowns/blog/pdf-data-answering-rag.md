![](/images/blog/chatpdfdoc-a-data-answering-rag/architecture.jpg)

ChatPDFDoc is a data-answering and retrieval system for uploaded PDF documents. It is a **Retrieval-Augmented Generation (RAG)** tool: upload PDFs, ask questions in natural language, and get answers grounded in the document text instead of relying on a whole-file prompt.

The project uses **gpt-4o-mini**, **ChromaDB**, and **OpenAI embeddings**. It is open source, free to use, and can be downloaded and run locally.

[Live app](https://chatpdfdoc-46sy.onrender.com) · [GitHub repository](https://github.com/ayotomiwasalau/chatpdfdoc) · [Project case study](/work/projects/building-chatpdfdoc-rag-fastapi-chromadb)

## What makes ChatPDFDoc useful

ChatPDFDoc is designed around a few practical goals:

- **Efficient selection of relevant data** — the system retrieves chunks that match the question instead of sending an entire PDF to the model.
- **Privacy by default** — users can try the tool without creating an account or logging in.
- **User control over data** — users can upload documents and delete them when they want.
- **Automatic cleanup** — uploaded data is cleared after the user has been away from the page for **45 minutes**.

These choices make the app useful as a simple document Q&A workflow while keeping the architecture clear enough to run locally or extend into a production system.

## How to set up ChatPDFDoc locally

Clone the repository:

```bash
git clone https://github.com/ayotomiwasalau/chatpdfdoc.git
cd chatpdfdoc
```

Create a virtual environment:

```bash
python3 -m venv .ragenv
```

Activate the environment:

```bash
chmod +x .ragenv/bin/activate
source .ragenv/bin/activate
```

Export your OpenAI API key:

```bash
export OPENAI_API_KEY="api_key"
```

Install dependencies:

```bash
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirement.txt
```

Start the app:

```bash
python main.py
```

Or run it with Uvicorn:

```bash
python -m uvicorn main:app --reload
```

Run the unit tests:

```bash
python -m pytest
```

## API docs

The hosted app exposes FastAPI docs at [https://chatpdfdoc-46sy.onrender.com/docs](https://chatpdfdoc-46sy.onrender.com/docs). These endpoints power the user interface for uploading documents, querying the RAG system, deleting indexed data, and checking service health.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Home route that returns a base or welcome response. |
| GET | `/add-document` | Adds a new document to the system for manual or test usage. |
| POST | `/api/v1/query` | Queries the LLM with context retrieved from uploaded documents. |
| POST | `/api/v1/upload` | Uploads a PDF document to the RAG system for indexing. |
| DELETE | `/api/v1/delete` | Deletes a previously uploaded document from the system. |
| GET | `/health` | Performs a health check to verify API status. |

## Design overview

At a high level, ChatPDFDoc is built around three core services:

1. **Backend API service** — handles requests and responses from the client.
2. **Pipeline service** — ingests uploaded PDFs, processes text, chunks content, embeds chunks, and stores them.
3. **LLM query service** — retrieves relevant chunks and calls a third-party LLM API with augmented context.

For queries, the flow is: client request -> FastAPI -> vector search in ChromaDB -> prompt augmentation -> OpenAI response -> client response.

For uploads, the flow is: PDF upload -> text extraction -> chunking -> embeddings -> vector storage.

## Current MVP implementation

![](/images/blog/chatpdfdoc-a-data-answering-rag/rag-currimpl.jpg)

The current implementation runs all core services on a single server instance. This is a practical MVP choice because it keeps deployment simple while preserving module boundaries that can be separated later.

### API layer

**FastAPI** handles the API service. It receives uploaded files, passes them to the pipeline module, and stores the processed output in the vector database after ingestion.

### Embeddings and vector database

The vector store is **ChromaDB**, and **OpenAI embeddings** convert document chunks into vector representations so similarity matching can be executed.

ChromaDB is a strong MVP choice because it is widely used in ML tooling, integrates with common RAG workflows, and is enough for a single-session document Q&A system without requiring a managed vector database on day one.

### Query layer

When the client sends a question, the API passes it to the query module. The query module runs a similarity match against the vector store and retrieves the chunks most relevant to the question.

### LLM layer

The retrieved context is added to the user query and sent to the foundation LLM through the OpenAI API. The implementation makes real API calls rather than mocking the model response, which exposes actual latency, cost, and rate-limit behavior during development.

### Quality assurance

The system includes unit tests and CI/CD so changes can be validated before deployment.

## Production-level design

![](/images/blog/chatpdfdoc-a-data-answering-rag/rag-prodimpl.jpg)

To build a production-grade RAG system that is scalable and resilient, the modules should be decoupled so they can run independently and scale based on their own workload.

### API layer

FastAPI can still serve the backend API at larger scale. Multiple API instances can run behind a load balancer for redundancy and higher request throughput.

### Storage layer

Uploaded PDFs should be stored in object storage such as **S3** or **HDFS**. This keeps large raw documents off application disks and allows the system to store file data at scale on cheaper storage.

### Orchestration layer

The pipeline module can be refactored to use tools like **Airflow** or **Apache Spark**. These tools support distributed processing, parallel tasks, batch jobs, and trigger-based uploads.

### Embeddings and vector database

The vector store can remain ChromaDB, but in production it should use a cloud-hosted or distributed setup with appropriate partitioning. A managed vector database can also be considered if tenant separation, indexing, and operational tooling become more important.

### Retrieval optimization

For faster retrieval, the system can batch similar queries, create indexes, partition data by tenant, organize domain information with knowledge graphs where useful, and cache hot queries so repeated questions do not hit the vector database every time.

### Metadata database

A separate SQL or NoSQL database can store metadata such as documents, sessions, users, upload status, and lineage. This lets the vector data and metadata scale separately, and it also makes analytics easier.

### Monitoring and logging

Each module should emit logs and metrics to a logging and monitoring system. Common options include **Loki**, **Prometheus**, **Grafana**, and the **ELK stack**. On AWS, **CloudWatch** can provide logging, monitoring, and alerting.

### LLM provider

OpenAI and Anthropic are strong LLM provider options for production consistency. Gemini can be cheaper, but it may be less consistent depending on the workload. MCP tooling can also make it easier to connect applications to model providers with less custom integration code.

## Code architecture

![](/images/blog/chatpdfdoc-a-data-answering-rag/rag-code-arch.jpg)

The code is designed with extensibility in mind. Each module has a single responsibility, which avoids overlapping logic and keeps the codebase easier to reason about.

The project also applies dependency inversion. Lower-level modules, such as the vector store or embedding provider, can be swapped or updated without changing many files or disrupting higher-level API behavior. This matters for RAG systems because embedding models, LLM providers, parsing tools, and vector databases change quickly.

## Trade-offs

| Pros | Cons |
|---|---|
| Answers are grounded in retrieved document chunks. | Each query can incur LLM API cost. |
| No login lowers friction for users. | The MVP is not a full multi-tenant production system. |
| Upload and delete endpoints give users data control. | PDF layout and extraction quality affect answer quality. |
| The monolith is simple to deploy and test. | Independent scaling requires a later architecture split. |
| The project is open source and locally runnable. | Retrieval misses can still produce weak or incomplete answers. |

## Resources

- [Project case study](/work/projects/building-chatpdfdoc-rag-fastapi-chromadb)
- [Live app](https://chatpdfdoc-46sy.onrender.com)
- [API docs](https://chatpdfdoc-46sy.onrender.com/docs)
- [Project repository](https://github.com/ayotomiwasalau/chatpdfdoc)
