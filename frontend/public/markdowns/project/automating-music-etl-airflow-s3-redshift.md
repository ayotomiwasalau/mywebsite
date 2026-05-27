![](/images/project/automating-music-etl-airflow-s3-redshift/airflow-dag-runs.png)

A music streaming company needed **automated, monitored ETL** from raw JSON in S3 into a Redshift warehouse — with reusable tasks, backfills, and data-quality checks after every run.

## Problem

Manual or ad hoc loads do not scale when log and song metadata grow daily. The pipeline had to:

- Ingest **JSON song metadata** and **user activity logs** from S3
- Load a **star schema** in Redshift for fast analytics queries
- Support **templated S3 paths** for scheduled runs and backfills
- **Validate** row counts and nulls after transforms

## Solution

An **Apache Airflow** DAG with custom operators ([GitHub](https://github.com/ayotomiwasalau/Pipeline_automation_with_airflow)):

1. **Stage operator** — `COPY` JSON from S3 into staging tables (templated keys for date partitions)
2. **Dimension / fact operators** — SQL transforms into star-schema tables (`users`, `songs`, `artists`, `time`, `songplays`)
3. **Data quality operator** — run SQL tests (e.g. null counts) and fail the DAG on mismatch

Schema: **fact `songplays`** + dimensions for users, songs, artists, and time — same Million Song Dataset case study pattern used in modern data-engineering curricula.

## Architecture breakdown

### Ingestion

- Song data: `s3://song_data` (partitioned JSON metadata)
- Log data: `s3://log_data` (simulated app events by date)

### Orchestration

Custom plugins under `plugins/` and DAG definitions under `dags/` — stage → transform → quality check as discrete, reusable tasks.

### Warehouse

`create_tables.sql` defines Redshift DDL; fact loads append-only; dimensions use truncate-insert where appropriate.

## Tech stack

| Layer | Tools |
|---|---|
| Orchestration | Apache Airflow |
| Storage | Amazon S3 |
| Warehouse | Amazon Redshift |
| Data | Million Song Dataset (JSON logs + song metadata) |
| Quality | Custom SQL check operator |

## Impact

- **Dynamic DAGs** from reusable operators instead of one-off scripts
- **Monitorable runs** with explicit failure on quality regression
- **Backfill-friendly** staging via templated S3 paths

## Links

- [GitHub — Pipeline_automation_with_airflow](https://github.com/ayotomiwasalau/Pipeline_automation_with_airflow)
