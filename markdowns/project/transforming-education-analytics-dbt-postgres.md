![](/images/project/transforming-education-analytics-dbt-postgres/hero.webp)

Analytics teams need **versioned, tested SQL transformations** inside the warehouse — not one-off scripts. This project applies **dbt Core** to the Open University Learning Analytics Dataset (OULAD), building staging views and production fact/dimension tables in PostgreSQL.

## Problem

Raw OULAD CSVs were loaded into Postgres, but transformations were ad hoc. The workflow had to:

- Define **raw → staging → production** models as code
- Enforce **data quality** with built-in and custom tests
- Support **selective refreshes** (upstream/downstream model runs)
- Stay maintainable with Jinja templating and YAML documentation

## Solution

dbt project on Postgres ([GitHub — dbt-transformation](https://github.com/ayotomiwasalau/dbt-transformation)):

1. **Sources** — declare raw tables in `warehouse_source.yml`
2. **Staging views** — thin selects from raw (`assessments_stg`, `student_registration_stg`, etc.)
3. **Production tables** — facts and dimensions (`student_fact`, `student_detail_dim`, `courses_fact`)
4. **Tests** — `not_null`, `relationships`, `accepted_values`, and custom business-logic tests
5. **Macros** — custom schema naming without hyphen concatenation issues

![](/images/project/transforming-education-analytics-dbt-postgres/dbt-archi.webp)

![](/images/project/transforming-education-analytics-dbt-postgres/dbt-staging.webp)

![](/images/project/transforming-education-analytics-dbt-postgres/dbt-prod-model.webp)

## Architecture breakdown

### Model layers

| Layer | Materialization | Example |
|---|---|---|
| Raw | Source tables | OULAD CSV imports |
| Staging | Views | `student_info_stg`, dropped unused `vle` tables |
| Production | Tables | Aggregated student/course facts |

### Quality gates

- Column-level tests in model YAML
- Custom test: students cannot have negative assessment counts
- `dbt test` and `dbt build` in CI-friendly workflows

![](/images/project/transforming-education-analytics-dbt-postgres/dbt-test.webp)

![](/images/project/transforming-education-analytics-dbt-postgres/dbt-output.webp)

### Operations

```bash
dbt run --models warehouse.staging.student_info_stg+
dbt run --models +warehouse.staging.student_info_stg
dbt docs generate
```

## Tech stack

| Layer | Tools |
|---|---|
| Transform | dbt Core, dbt-postgres |
| Warehouse | PostgreSQL |
| Data | OULAD (Kaggle) |
| Env | Conda / Python 3.10 |

## Impact

- **ELT best practice** — dbt owns the T; extraction stays outside the tool
- **Testable analytics code** with lineage and generated docs
- **Reusable patterns** for staging/production splits and incremental adoption

## Links

- [GitHub — dbt-transformation](https://github.com/ayotomiwasalau/dbt-transformation)
- [Blog — dbt workflow basics](/posts/dbt-workflow-basics)
