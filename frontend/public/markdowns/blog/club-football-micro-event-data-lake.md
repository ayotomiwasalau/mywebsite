![](/images/blog/club-football-micro-event-data-lake/architecture.png)

## System Overview

Most football analytics stops at match-level aggregates — shots, possession, cards. This system ingests **atomic match events** (passes, duels, shots, tackles) from multiple sources, lands them in **Amazon S3**, transforms them with **Apache Spark** into a star schema, orchestrates warehouse loads with **Apache Airflow**, and serves analytics from **Amazon Redshift**. The curated dataset is published on Kaggle for dashboards and ML (e.g. expected goals).

End-to-end flow: raw JSON/CSV/API extracts → S3 → Spark ETL → processed CSV on S3 → Airflow DAG → Redshift → SQL analytics and public dataset release.

## Component Breakdown

- **Amazon S3** — system of record for raw and processed layers
- **Apache Spark** — distributed parsing of nested JSON and star-schema builds across 1M+ event rows
- **Apache Airflow** — DAGs for table creation, S3 → Redshift `COPY`, and data-quality checks
- **Amazon Redshift** — columnar warehouse for event-grain queries and ML workloads
- **Sources** — Figshare Soccer match data, Kaggle Football Events, Rapid Soccer API (top five European leagues, 2017/18)

## Design Decisions

**Spark over single-node Python** — event volume and nested JSON exceed comfortable single-machine ETL.

**Star schema centred on `match_event`** — fact at event grain with dimensions for `match`, `club`, `player`, and `referee`.

**S3 as landing and processed zone** — decouples compute from storage; Spark writes CSV before warehouse load.

**Airflow for warehouse orchestration** — repeatable, monitorable loads with explicit failure on quality checks.

## Trade-offs

| Pros | Cons |
|---|---|
| Event-grain data for xG-style modelling | Batch pipeline, not live match streaming |
| Proven AWS stack (S3, Spark, Airflow, Redshift) | Redshift cost vs serverless alternatives |
| Public Kaggle release for reproducibility | Multi-source ETL maintenance |
| Star schema simplifies downstream SQL | JSON parsing logic evolves with sources |

## Scaling Considerations

At ~1M+ events today, a **3-node Spark cluster** suffices. For 100× growth: **incremental per-match loads**, embed Spark in Airflow, **scheduled daily ingestion**, **Redshift partitioning + WLM** for concurrent analysts, and **separate raw vs curated S3 buckets** with lifecycle policies.

## Link

[View Project Case Study](/work/projects/building-micro-event-data-lake-spark-airflow-redshift)
