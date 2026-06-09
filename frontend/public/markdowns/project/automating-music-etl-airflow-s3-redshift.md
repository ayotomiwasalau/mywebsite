![](/images/project/automating-music-etl-airflow-s3-redshift/run_queries.png)

A music streaming analytics scenario needs **automated, monitored ETL** from raw JSON in **Amazon S3** into an **Amazon Redshift** star schema. This project uses **Apache Airflow** with custom operators so nightly loads, historical backfills, and post-load quality checks run on a schedule—not from manual scripts.

[GitHub — Pipeline_automation_with_airflow](https://github.com/ayotomiwasalau/Pipeline_automation_with_airflow)

## Context

As listen events and catalog metadata accumulate, one-off Python jobs become hard to rerun, monitor, and trust. Analysts need a warehouse layer they can query with consistent dimensions; operators need the pipeline to **fail visibly** when a bad extract lands. Concretely, the pipeline had to:

- Ingest **JSON song files** and **log files** from partitioned S3 prefixes
- Load a **star schema** optimized for analyst SQL (`songplays` fact + dimensions)
- Support **templated S3 keys** for nightly runs and historical backfills
- **Fail loudly** when row counts or null rates regress after transforms

## Approach

The build centers on a single Airflow DAG composed of **reusable operators**—each encapsulating one concern (stage, transform, or quality)—wired in dependency order on the Million Song Dataset domain:

1. **Stage operator** — `COPY` JSON from S3 into staging tables using templated paths (`song_data`, `log_data` partitions)
2. **Dimension / fact operators** — SQL transforms into `users`, `songs`, `artists`, `time`, and fact `songplays`
3. **Data quality operator** — SQL checks (e.g. null counts on keys); DAG fails if thresholds break

Plugins under `plugins/` keep stage, transform, and QA logic **reusable** across DAGs; `create_tables.sql` defines Redshift DDL. The pattern mirrors the Million Song Dataset curriculum: same domain, production-style orchestration.

### Pipeline shape

End to end, each DAG run moves data through three layers before analysts see curated tables. Templated S3 keys tie each run to an `execution_date`, which is what makes nightly loads and backfills the same code path.

**Staging** lands raw JSON in Redshift staging tables with `COPY` and JSON paths templated to `song_data` and `log_data` prefixes. **Transform** tasks insert into dimensions—artists and songs deduped by natural keys, time dimension exploded from timestamps—and append fact `songplays` linking users, songs, and time keys. **Quality** runs last so bad nightly loads never reach analyst-facing tables silently.

![](/images/project/automating-music-etl-airflow-s3-redshift/airflow-dag-runs.png)

Evidence in the screenshot: green task runs across stage → dimensional load → quality check—operators behave like a mini-framework instead of copy-pasted SQL files. Failed QA turns the DAG red in the Airflow UI, which is the operational signal to page whoever owns the extract.

Custom operators subclass Airflow’s base operator so DAG files stay declarative: pass connection IDs, S3 keys, and SQL paths as parameters rather than embedding hundred-line scripts in the DAG definition. That pattern is what makes the project useful as a template when the song/log sources change but the stage → mart → QA shape stays the same.

## Tech stack

The pipeline stays intentionally small: orchestration in Airflow, durable files in S3, and analyst-facing tables in Redshift. Custom plugins hold the reusable operator logic.

| Layer | Tools |
|---|---|
| Orchestration | Apache Airflow |
| Storage | Amazon S3 |
| Warehouse | Amazon Redshift |
| Data | Million Song Dataset (JSON logs + song metadata) |
| Quality | Custom SQL check operator |

## Relation to the Spark EMR project

This warehouse load complements an earlier transform path on the same dataset. Understanding both shows how batch processing and orchestrated loads often split across tools in real teams.

The same Million Song **domain** appears in my [Spark on EMR](/work/projects/processing-song-logs-spark-emr-s3) case study: Spark builds dimensional files in S3; this Airflow project loads and maintains the **Redshift warehouse** with scheduled operators. Together they show **batch transform** vs **orchestrated warehouse load**—common in real teams where EMR or Spark writes lakes and Airflow manages COPY + SQL marts.

## Impact

Beyond finishing the curriculum exercise, the project demonstrates operable patterns: declarative DAGs, observable task status, and QA that blocks bad data.

- **Dynamic DAGs** from composable operators—not one-off cron scripts
- **Observable failures** when QA SQL detects bad loads before analysts do
- **Backfill-friendly** staging via templated `execution_date` paths
- **Warehouse-ready star schema** for BI and downstream ML features

## Links

Source code and operator definitions live in the repository below.

- [GitHub — Pipeline_automation_with_airflow](https://github.com/ayotomiwasalau/Pipeline_automation_with_airflow)
