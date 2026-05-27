![](/images/project/processing-song-logs-spark-emr-s3/spark-emr-hero.webp)

A music streaming startup stores **song metadata and user activity logs as JSON in S3** but needs dimensional tables analysts can query. This project builds a **Spark ETL pipeline on EMR** that outputs a star schema back to S3.

## Problem

Raw JSON logs and song files are not analytics-ready. The team needed:

- Distributed processing for growing log volume
- A **star schema** (`songplays` fact + user/song/artist/time dimensions)
- Repeatable ETL from S3 → transform → S3 without manual notebook runs in production

## Solution

ETL with **Apache Spark on AWS EMR** ([GitHub](https://github.com/ayotomiwasalau/Using_Spark_emr_with_S3)):

1. Read song JSON from `s3://udacity-dend/song_data` and logs from `s3://udacity-dend/log_data`
2. Transform in Spark (`etl.py` + exploratory `notebook.ipynb`)
3. Write parquet/CSV dimensional outputs to S3 for downstream Redshift or Athena loads

![](/images/project/processing-song-logs-spark-emr-s3/spark-etl-notebook.png)

![](/images/project/processing-song-logs-spark-emr-s3/spark-output-s3.png)

![](/images/project/processing-song-logs-spark-emr-s3/spark-cluster.png)

## Architecture breakdown

### Sources

- **Song dataset** — Million Song Dataset subset, JSON partitioned by track ID prefix
- **Log dataset** — simulated app events (plays, user agents, timestamps) in date-partitioned JSON

### Processing

Spark on EMR handles joins, deduplication, and time dimension extraction. Configuration via `dl.cfg` for data lake paths.

### Target model

| Type | Table |
|---|---|
| Fact | `songplays` |
| Dimensions | `users`, `songs`, `artists`, `time` |

Star schema keeps analyst SQL simple and read patterns fast.

## Tech stack

| Layer | Tools |
|---|---|
| Processing | Apache Spark |
| Compute | AWS EMR |
| Storage | Amazon S3 |
| Languages | Python, Jupyter |

## Impact

- **Scalable ETL** for JSON log + metadata at streaming-app volumes
- **Analytics-ready tables** instead of raw file scans
- **Notebook → script path** (`notebook.ipynb` → `etl.py`) for production hardening

## Links

- [GitHub — Using_Spark_emr_with_S3](https://github.com/ayotomiwasalau/Using_Spark_emr_with_S3)
