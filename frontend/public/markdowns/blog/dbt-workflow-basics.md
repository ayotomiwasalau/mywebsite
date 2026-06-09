![](/images/blog/dbt-workflow-basics/architecture.webp)

## System overview

**dbt (data build tool)** is a workflow tool built mainly for **transformation**. It connects to one warehouse and transforms data **inside** that database by running SQL to create tables and views—it handles the **T** in **ELT**, not extract/load from database A to B.

dbt works with **Amazon Redshift**, **Google BigQuery**, **PostgreSQL**, **Snowflake**, **Starburst**, **Trino**, **Apache Spark**, and more. Pair it with orchestrators like **Airflow**, or use **dbt Cloud** vs open-source **dbt Core** locally.

**Objective:** illustrate a real transformation project on **PostgreSQL** with **dbt Core**, using the [Open University Learning Analytics Dataset (OULAD)](https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad) from Kaggle.

[GitHub — dbt-transformation](https://github.com/ayotomiwasalau/dbt-transformation) · [Project case study](/work/projects/transforming-education-analytics-dbt-postgres)

## dbt in the ELT pipeline

Modern analytics teams fail when transformation logic lives in disconnected scripts and one-off notebooks. dbt version-controls SQL models, runs them in dependency order, tests outputs, and generates documentation—after raw data already exists in the warehouse.

**Extract / load** — OULAD CSVs must land in Postgres **outside** dbt (Python/Pandas or the DBMS CSV import). dbt does not extract for you.

![](/images/blog/dbt-workflow-basics/dbt_archi.webp)

When extraction finishes, raw tables look like this in the database:

![](/images/blog/dbt-workflow-basics/dbt_extract.webp)

**Transform** — Models are Jinja-templated `SELECT` statements. `{{ source('raw', 'assessments') }}` references declared sources; `{{ ref('student_info_stg') }}` references other models. `dbt run` executes the DAG; **`dbt build`** runs models **and** tests—preferred in pipelines when bad data must block deploys.

### Setting up the environment

Create an isolated Python environment (Anaconda or venv):

```bash
conda create --name dbtenv python=3.10
conda activate dbtenv
```

![](/images/blog/dbt-workflow-basics/dbt_env_crtd.webp)

Install dbt Core and the Postgres adapter:

```bash
pip install dbt-core dbt-postgres
```

Initialize a project in your folder (e.g. `project_dbt`):

```bash
dbt init project_1
```

![](/images/blog/dbt-workflow-basics/dbt_proj_dir.webp)

Configure `~/.dbt/profiles.yml` after init:

```yaml
project_1:
  outputs:
    dev:
      type: postgres
      threads: 1
      host: localhost
      port: 5432
      user: ayotomiwasalau
      pass: ""
      dbname: datadb
      schema: warehouse
  target: dev
```

## Model layers: raw, staging, production

The `models/` folder holds all transformation logic. dbt compiles models into SQL under `target/`.

Three layers in this project:

| Layer | Role |
|---|---|
| **Raw** | Tables as imported from CSV—declared as **sources**, not dbt models |
| **Staging** | Standardized views; drop unused tables (`vle`, `student_vle`) from the core path |
| **Production** | Facts and dimensions—combined and aggregated for analytics |

**Raw (sources)** — Documented in YAML; no transformation yet.

![](/images/blog/dbt-workflow-basics/dbt_schema_model.webp)

**Staging** — Thin views over raw with consistent naming and typing.

![](/images/blog/dbt-workflow-basics/dbt_staging.webp)

**Production** — Business-ready facts and dimensions (measures vs characteristics).

![](/images/blog/dbt-workflow-basics/dbt_prod_model.webp)

Model SQL and schema YAML live under `models/`:

![](/images/blog/dbt-workflow-basics/dbt_model_def.webp)

Declare raw tables in **`warehouse_source.yml`**:

```yaml
version: 2
sources:
  - name: raw
    database: datadb
    tables:
      - name: assessments
      - name: courses
      - name: student_assessment
      - name: student_info
      - name: student_registration
      - name: student_vle
      - name: vle
```

**Staging example — `assessments_stg.sql`**

```sql
{{ config(materialized='view', schema='staging') }}

SELECT *
FROM {{ source('raw', 'assessments') }}
```

**`assessments_stg.yml`** (description + tests):

```yaml
version: 2
models:
  - name: assessments_stg
    description: "Information about assessments in module-presentations."
    columns:
      - name: code_module
        description: "Identification code for the module."
        tests:
          - not_null
      - name: id_assessment
        description: "Identification number of the assessment."
```

**Production example — `student_fact.sql`**

```sql
{{ config(materialized='table', schema='production') }}

SELECT
    si.id_student,
    si.code_module,
    si.code_presentation,
    si.num_of_prev_attempts,
    si.studied_credits,
    si.final_result,
    COUNT(sa.id_assessment) AS number_of_assessments_done
FROM {{ ref("student_info_stg") }} si
LEFT JOIN {{ ref("student_assessment_stg") }} sa ON si.id_student = sa.id_student
GROUP BY
    si.id_student,
    si.code_module,
    si.code_presentation,
    si.num_of_prev_attempts,
    si.studied_credits,
    si.final_result
```

Jinja `{{ }}` appears in models, tests, and macros—it templates SQL and cuts repetition.

Run transformations:

```bash
dbt run
```

Use **`dbt run`** when you only need to refresh models. Use **`dbt build`** when you want models **and** tests in one pass.

```bash
dbt build
```

![](/images/blog/dbt-workflow-basics/dbt_output.webp)

Results in the database:

![](/images/blog/dbt-workflow-basics/dbt_folder_output.webp)

![](/images/blog/dbt-workflow-basics/dbt_db_output0.webp)

![](/images/blog/dbt-workflow-basics/dbt_db_output1.webp)

## Materializations and when to use them

Materialization controls how dbt persists each model:

- **view** — Virtual table; results computed at query time. Good for **staging** freshness without extra storage.
- **table** — Physical storage; faster reads for heavy or repeated queries. Used here for **`student_fact`**.
- **incremental** — Append/update only new or changed rows by key—essential at scale (OULAD uses full rebuilds today).
- **ephemeral** — Inline logic for downstream models only; no database object.

Define per model in SQL:

```sql
{{ config(materialized='view', schema='staging') }}
```

Or set folder defaults in `dbt_project.yml`:

```yaml
models:
  warehouse:
    staging:
      +materialized: table
    production:
      +materialized: view
```

| Materialization | Strength | Cost |
|---|---|---|
| view | Always fresh, minimal storage | Query-time compute |
| table | Fast reads, predictable performance | Storage + full rebuild |
| incremental | Efficient on large facts | Merge logic complexity |
| ephemeral | Reusable logic, no clutter | Harder to debug in isolation |

## Tests: built-in, generic, and custom

Three testing styles keep data trustworthy:

**Built-in** — Column tests in YAML: `not_null`, `unique`, `accepted_values`, `relationships`.

```yaml
models:
  - name: student_fact
    columns:
      - name: id_student
        tests:
          - relationships:
              to: ref('student_detail_dim')
              field: id_student
```

```yaml
models:
  - name: student_detail_dim
    columns:
      - name: gender
        tests:
          - accepted_values:
              values: ['M', 'F']
```

**Generic** — Reusable Jinja test templates, e.g. integers only:

```jinja
{% test contains_only_integers(model, column_name) %}
    SELECT {{ column_name }}
    FROM {{ model }}
    WHERE {{ column_name }} ~ '^\d+$'
{% endtest %}
```

```yaml
models:
  - name: courses_fact
    columns:
      - name: code_module
        tests:
          - contains_only_integers
```

**Custom (singular)** — SQL that returns failing rows for business rules:

```sql
-- student_not_registered_no_assessment.sql
SELECT id_student
FROM {{ ref("student_fact") }}
WHERE number_of_assessments_done < 0
LIMIT 5
```

```bash
dbt test
```

Pass and fail examples:

![](/images/blog/dbt-workflow-basics/dbt_test.webp)

![](/images/blog/dbt-workflow-basics/dbt_test1.webp)

## Macros

**Macros** are reusable SQL fragments—schema naming, date spines, surrogate keys. This project overrides **schema naming** so models land in `staging` and `production` instead of hyphen-concatenated defaults:

```jinja
{% macro generate_schema_name(custom_schema_name, node) -%}
    {%- set default_schema = target.schema -%}
    {%- if custom_schema_name is none -%}
        {{ default_schema }}
    {%- else -%}
        {{ custom_schema_name | trim }}
    {%- endif -%}
{%- endmacro %}
```

## Operations: run, build, and selective refresh

Day-to-day commands:

```bash
dbt run
dbt build
dbt test
dbt debug
dbt docs generate
dbt docs serve
```

**Selective refresh** (modern CLI uses `--select`; older versions used `--models`):

```bash
dbt run --select production
```

![](/images/blog/dbt-workflow-basics/dbt_model_prod.webp)

```bash
dbt run --select warehouse.production.student_fact
```

![](/images/blog/dbt-workflow-basics/dbt_referesh_view.webp)

Downstream dependents (`+` suffix):

```bash
dbt run --select warehouse.staging.student_info_stg+
```

![](/images/blog/dbt-workflow-basics/dbt_referesh_downstream.webp)

Upstream dependencies (`+` prefix):

```bash
dbt run --select +warehouse.staging.student_info_stg
```

![](/images/blog/dbt-workflow-basics/dbt_refresh_upstream.webp)

Verify connection and profile:

```bash
dbt debug
```

![](/images/blog/dbt-workflow-basics/dbt_debug.webp)

Full rebuild of incremental/table models:

```bash
dbt run --full-refresh
```

Fill model `.yml` descriptions, then generate docs (`catalog.json` in `target/`):

```bash
dbt docs generate
```

## Design decisions

**dbt for transforms only** — Ingestion stays simple; analytics SQL lives in git with review and lineage.

**Views in staging, tables in production** — Staging stays fresh; production facts optimize BI read paths.

**YAML colocated tests** — Quality gates run with `dbt build` and can block CI deploys.

**Postgres for learning** — Swap `dbt-postgres` for `dbt-snowflake` or `dbt-bigquery` without rewriting business logic.

**Drop unused OULAD tables in staging** — Exclude `vle` / `student_vle` so the DAG stays focused on student outcomes.

## Trade-offs

| Pros | Cons |
|---|---|
| Analytics code in version control with DAG lineage | dbt does not extract or schedule loads |
| Tests and docs from the same YAML | Jinja + project layout learning curve |
| Selective model refresh saves dev time | Postgres scale limits vs cloud DWHs |
| Adapter ecosystem (Snowflake, BigQuery, etc.) | Large tables need incremental strategy |
| CI-friendly (`dbt build` on pull requests) | Macro abuse can hide logic |

## Scaling considerations

Move to a cloud warehouse adapter, add **incremental models** on large facts, schedule with **Airflow** or **dbt Cloud**, and run **`dbt build` in CI** on every pull request. Add **snapshots** for slowly changing attributes, **exposures** for downstream dashboards, and packages like **dbt_expectations** for richer monitoring. At org scale, split by domain with **dbt mesh** contracts.

dbt Cloud usage is not covered here—see [dbt Cloud docs](https://docs.getdbt.com/docs/cloud/about-cloud) for hosted runs and scheduling.

## Link

Repo layout, full model list, and run instructions: [View project case study](/work/projects/transforming-education-analytics-dbt-postgres).
