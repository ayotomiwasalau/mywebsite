---
title: Test Post — Markdown Rendering Check
slug: test-markdown-rendering
description: A sample post to verify headings, lists, code, links, and images render correctly.
tags: ["test", "markdown", "data-engineering"]
---
![](/images/blog/test-blog-project-ayonz123/ 87fb75d8-cecc-44d8-889e-6718a8a9c872.png)
# Test Post — Markdown Rendering Check

This is a **smoke test** for the blog editor and renderer. If everything below looks correct, basic markdown support is working.

## Headings

### H3 — Subsection
#### H4 — Detail level
![](/images/blog/test-blog-project-ayonz123/ sample_mailchimp-ff.jpeg)
---

## Text formatting

- **Bold text**
- *Italic text*
- ~~Strikethrough~~
- `inline code`
- A [link to the homepage](/)

> Blockquote: Good data platforms are boring in production — that means they work.

---

## Lists

### Unordered
- Pipelines that scale
- Metric dashboards teams trust
- Operations automated with AI

### Ordered
1. Ingest raw data
2. Transform with quality checks
3. Serve trusted metrics

### Task list
- [x] Terraform applied
- [x] Frontend deployed
- [ ] Run full markdown test in prod

---

## Code block

```python
def pipeline_health(rows_processed: int, failures: int) -> float:
    if rows_processed == 0:
        return 0.0
    return 1 - (failures / rows_processed)

![sample mailchimp ff](https://votenigeria.com/images/blog/test-blog-project-ayonz123/sample_mailchimp-ff.jpg)

![sample mailchimp ff](https://votenigeria.com/images/blog/test-blog-project-ayonz123/sample_mailchimp-ff.jpg)
