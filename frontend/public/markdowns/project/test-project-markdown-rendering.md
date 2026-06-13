![](/images/project/test-project-markdown-rendering/sample_mailchimp.jpg)

This is a **smoke test project** for the admin editor and project renderer. It mirrors real project pages—intro, context, approach, stack, and impact—while exercising headings, lists, code, tables, links, and images.

[GitHub — sample repo](https://github.com/ayotomiwasalau) · [Homepage](/)

## Context

Portfolio project pages need to render long-form markdown reliably after upload, S3 sync, and CloudFront delivery. A dedicated test document makes it easy to verify formatting without touching production project copy.

## Approach

The test page covers the same sections as shipped projects in four steps:

1. **Intro block** — bold keywords, external links, and inline navigation.
2. **Structured sections** — Context, Approach, Tech stack, Impact, and Links.
3. **Rich markdown** — tables, code fences, blockquotes, and task lists.
4. **Images** — local `/images/project/...` paths for upload and CDN checks.

![](/images/project/test-project-markdown-rendering/1_Iv5ntHstgQowxRl6PsNa9g.jpg)

### Text formatting

- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- `inline code`
- A [link to the work page](/work)

> Blockquote: Good data platforms are boring in production — that means they work.

### Lists

#### Unordered
- Pipelines that scale
- Metric dashboards teams trust
- Operations automated with AI

#### Ordered
1. Ingest raw data
2. Transform with quality checks
3. Serve trusted metrics

#### Task list
- [x] Markdown file created
- [x] Image paths use `/images/project/` prefix
- [ ] Upload hero image via admin editor

## API surface

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/v1/upload` | Upload test asset |
| GET | `/api/v1/projects/{slug}` | Fetch project metadata |

## Run locally

```bash
cd frontend && npm run dev
# Open http://localhost:3000/work/projects/test-project-markdown-rendering
```

```python
def pipeline_health(rows_processed: int, failures: int) -> float:
    if rows_processed == 0:
        return 0.0
    return 1 - (failures / rows_processed)
```

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | FastAPI, Python |
| Storage | S3, CloudFront |
| Content | Markdown, DynamoDB |

## Impact

Use this page to confirm the full content pipeline end to end:

- **Editor flow** — create, edit, and save project markdown
- **Image uploads** — keys land at `images/project/test-project-markdown-rendering/`
- **Public render** — headings, tables, and code blocks display correctly

## Links

- [Work — projects index](/work)
- [GitHub — portfolio](https://github.com/ayotomiwasalau)

![1 Iv5ntHstgQowxRl6PsNa9g](https://votenigeria.com/images/project/test-project-markdown-rendering/1_Iv5ntHstgQowxRl6PsNa9g.jpg)
