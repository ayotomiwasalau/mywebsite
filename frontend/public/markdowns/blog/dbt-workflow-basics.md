![](/images/blog/dbt-workflow-basics/architecture.webp)

## System Overview

**dbt Core** transforms data **inside PostgreSQL** — it owns the **T** in ELT. This project models the Open University Learning Analytics Dataset (OULAD) as versioned SQL: raw sources → staging views → production facts and dimensions, with built-in and custom tests. Extraction happens outside dbt (CSV import); dbt compiles Jinja-templated models and runs `dbt run`, `dbt test`, and `dbt docs generate`.

## Component Breakdown

- **PostgreSQL** — warehouse hosting raw OULAD tables and transformed schemas
- **dbt Core + dbt-postgres** — project with `models/`, `macros/`, and YAML docs/tests
- **Sources** — `warehouse_source.yml` declares raw table references
- **Staging views** — thin selects (`assessments_stg`, `student_registration_stg`, etc.)
- **Production tables** — facts and dimensions (`student_fact`, `student_detail_dim`, `courses_fact`)
- **Tests** — `not_null`, `relationships`, `accepted_values`, and custom business-logic tests

## Design Decisions

**dbt for transforms only** — keeps extraction simple (Pandas or DB import) while analytics SQL lives in git with lineage.

**Staging vs production split** — views for staging (cheap refresh); tables for production aggregates (read performance).

**YAML-driven tests** — column tests live beside model definitions so quality gates run with every `dbt build`.

**Custom macro for schema naming** — avoids hyphenated schema names from default dbt behaviour.

**Jinja templating** — `{{ ref() }}` and `{{ source() }}` reduce duplication and document dependencies.

## Trade-offs

| Pros | Cons |
|---|---|
| Analytics code in version control | dbt does not extract or orchestrate loads |
| Built-in lineage and docs | Postgres scale limits vs cloud DWHs |
| Selective model refresh (`dbt run --models …`) | Learning curve for Jinja + project layout |
| Testable, reviewable SQL | Full refreshes on large tables can be slow |

## Scaling Considerations

Move the same dbt project to **Snowflake or BigQuery** with adapter swap, add **incremental models** for large fact tables, wire **Airflow** or dbt Cloud for scheduling, and enforce **CI** (`dbt test` on pull requests). Use `dbt build` in production pipelines for atomic run + test.

## Link

[View Project Case Study](/work/projects/transforming-education-analytics-dbt-postgres)
