![](/images/project/transforming-education-analytics-dbt-postgres/hero.webp)

This project applies **dbt Core** to the [Open University Learning Analytics Dataset (OULAD)](https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad) in **PostgreSQL**—turning raw education CSVs into tested **staging views** and **production fact/dimension tables** for student outcome analytics.

[GitHub — dbt-transformation](https://github.com/ayotomiwasalau/dbt-transformation) · [Design essay (blog)](/work/blogs/dbt-workflow-basics)

## Context

OULAD files were loaded into Postgres, but transformations lived in ad hoc SQL with no lineage, tests, or docs. The workflow needed **versioned models**, **data quality gates**, **selective refreshes**, and analyst-ready marts—without a separate ETL server. dbt owns the **T** in **ELT**; ingestion stays outside the tool.

## Approach

Raw OULAD tables stay in Postgres; dbt declares sources, builds staging views, materializes production facts and dimensions, and runs tests on every build:

1. **Extract / load** — import OULAD CSVs into raw Postgres tables (Pandas or DBMS import)
2. **Sources** — declare raw tables in `warehouse_source.yml` (`assessments`, `student_info`, `student_registration`, and related tables)
3. **Staging views** — standardized selects over `{{ source('raw', ...) }}`; exclude `vle` and `student_vle` from the core DAG
4. **Production tables** — facts and dimensions (`student_fact`, `student_detail_dim`, `courses_fact`) with aggregations such as assessments completed per student–module presentation
5. **Tests & macros** — built-in, generic, and singular tests; `generate_schema_name` macro for clean `staging` / `production` schemas

![](/images/project/transforming-education-analytics-dbt-postgres/dbt-archi.webp)

## Architecture breakdown

The DAG flows from declared raw sources through staging views into production tables, with tests wired at each layer. Sources, model materializations, and quality gates are summarized below.

### Data source

| Dataset | Role |
|---|---|
| [OULAD (Kaggle)](https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad) | Student registrations, assessments, demographics, course metadata |

### Model layers

| Layer | Materialization | Examples |
|---|---|---|
| Raw | Source tables (outside dbt models) | `assessments`, `student_info`, `student_registration` |
| Staging | Views | `assessments_stg`, `student_info_stg`, `student_assessment_stg` |
| Production | Tables | `student_fact`, `student_detail_dim`, `courses_fact` |

![](/images/project/transforming-education-analytics-dbt-postgres/dbt-staging.webp)

![](/images/project/transforming-education-analytics-dbt-postgres/dbt-prod-model.webp)

Production models join staging with `{{ ref() }}` so renames propagate through the DAG. `student_fact` rolls up assessment counts per student and module presentation; dimensions hold demographics and course attributes for cohort analysis.

Example production logic:

```sql
{{ config(materialized='table', schema='production') }}

SELECT
    si.id_student,
    si.code_module,
    si.final_result,
    COUNT(sa.id_assessment) AS number_of_assessments_done
FROM {{ ref("student_info_stg") }} si
LEFT JOIN {{ ref("student_assessment_stg") }} sa ON si.id_student = sa.id_student
GROUP BY si.id_student, si.code_module, si.final_result
```

### Quality gates

| Type | Examples in repo |
|---|---|
| Built-in | `not_null`, `relationships`, `accepted_values` on gender and keys |
| Generic | `contains_only_integers` on module codes |
| Singular | No negative `number_of_assessments_done` in `student_fact` |

Run with `dbt test` or atomically via **`dbt build`** (models + tests).

![](/images/project/transforming-education-analytics-dbt-postgres/dbt-test.webp)

### Run commands

```bash
dbt build                             # models + tests (recommended)
dbt run --select student_info_stg+    # one model + downstream
dbt run --select +student_fact        # upstream deps for one model
dbt docs generate && dbt docs serve   # lineage and column catalog
```

![](/images/project/transforming-education-analytics-dbt-postgres/dbt-output.webp)

## Tech stack

dbt Core on PostgreSQL keeps transforms version-controlled and adapter-portable—swap the warehouse profile without rewriting model logic.

| Layer | Tools |
|---|---|
| Transform | dbt Core, dbt-postgres |
| Warehouse | PostgreSQL (`datadb`, schema `warehouse`) |
| Data | OULAD (Kaggle) |
| Environment | Python 3.10, Conda |

## Setup

```bash
conda create --name dbtenv python=3.10 && conda activate dbtenv
pip install dbt-core dbt-postgres
dbt init project_1
```

Configure `~/.dbt/profiles.yml` for local Postgres, import OULAD CSVs into raw tables, then from the project directory:

```bash
dbt build
dbt docs generate
```

Step-by-step modeling, materializations, and test patterns: [dbt workflow basics](/work/blogs/dbt-workflow-basics).

## Impact

The project demonstrates a production-style analytics layer on open education data—testable, documented, and ready for BI tools.

- **ELT pattern** — dbt owns transforms; CSV ingestion stays simple
- **Testable analytics code** with dependency graph and generated documentation
- **Staging vs production split** portable to Snowflake or BigQuery by swapping the adapter
- **Education analytics ready for BI** — student facts with assessment counts and demographic dimensions

## Links

Model SQL and test definitions live in the repository; the blog walks through dbt workflow patterns step by step.

- [GitHub — dbt-transformation](https://github.com/ayotomiwasalau/dbt-transformation)
- [Blog — dbt workflow basics](/work/blogs/dbt-workflow-basics)
