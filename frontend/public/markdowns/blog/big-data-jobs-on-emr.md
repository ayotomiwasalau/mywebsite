![](/images/blog/big-data-jobs-on-emr/architecture.jpg)

## System Overview

A music streaming startup stores **song metadata and user activity logs as JSON in S3** but needs production Spark jobs — not notebook-only prototypes. This system provisions an **EMR cluster**, develops ETL in **Jupyter**, packages logic as `spark_job_emr.py`, and deploys via **AWS Console**, **CLI**, or **Boto3**. Output is a **star schema** (fact `songplays` + user/song/artist/time dimensions) written back to S3 for downstream analytics.

## Component Breakdown

- **Amazon S3** — input JSON (Million Song Dataset + event-sim logs) and dimensional outputs
- **AWS EMR** — managed Spark cluster (Hadoop, Hive, Jupyter, Livy)
- **Apache Spark** — distributed transforms: joins, dedup, time dimensions
- **EMR Studio / Jupyter** — interactive development before production packaging
- **Deployment** — console steps, `aws emr add-steps`, `cli_deploy.sh`, `python_deploy.py`
- **Target schema** — fact `songplays`; dimensions `users`, `songs`, `artists`, `time`

## Design Decisions

**EMR over self-managed Spark** — faster cluster setup with preinstalled ecosystem; pay per cluster uptime.

**Notebook → script workflow** — validate logic interactively, then freeze as `spark_job_emr.py` for repeatable steps.

**Cluster deploy mode for production** — driver runs on EMR workers; more reliable than client mode for long jobs.

**S3 as source and sink** — decouples storage from compute; outputs feed Redshift or Athena later.

**Three deploy paths** — UI for learning, CLI for ops, Boto3 for automation.

## Trade-offs

| Pros | Cons |
|---|---|
| Scalable distributed processing | EMR cluster cost if left running |
| Multiple deployment options | Cold start time for new clusters |
| Star schema ready for analysts | JSON parsing bugs costly at scale |
| Well-documented AWS pattern | Requires VPC/subnet/IAM setup |

## Scaling Considerations

Use **transient clusters** (terminate after step), **spot instances** for task nodes, **partitioned S3 layouts** for logs, and **Airflow** to trigger `add-steps` on a schedule. For 10× data volume, increase core/task capacity, enable **dynamic allocation**, and consider **Delta/Iceberg** for idempotent writes.

## Link

[View Project Case Study](/work/projects/deploying-spark-etl-jobs-aws-emr)
