![](/images/project/processing-song-logs-spark-emr-s3/spark-head.png)

A music streaming startup stores **song metadata and user activity logs as JSON in S3** but needs dimensional tables analysts can query. This project implements **Apache Spark on AWS EMR** to transform raw JSON into a **star schema** written back to S3—separate from the Airflow/Redshift repo but the same Million Song Dataset domain.

[GitHub — Using_Spark_emr_with_S3](https://github.com/ayotomiwasalau/Using_Spark_emr_with_S3) · [Architecture & design (blog)](/work/blogs/big-data-jobs-on-emr)

## Context

The lake holds everything analysts need, but not in a shape they can query efficiently. Log files and song metadata arrive as nested JSON; joining them at notebook scale works until volume and repeatability become the constraint. The transform layer had to solve three gaps:

- Joining millions of log lines to song catalog rows needs **distributed** compute
- Analysts expect **facts and dimensions**, not nested JSON per query
- Notebook experiments must graduate to a **scripted, repeatable** job on a cluster

## Approach

A Spark job reads partitioned JSON from the Udacity dend lake, builds fact and dimension tables in memory, and writes curated outputs back to S3 for downstream warehouse loads. Development follows a **notebook-first, script-second** path so joins can be validated interactively before the same logic ships as `etl.py` on EMR:

1. Read song JSON from `s3://udacity-dend/song_data` and logs from `s3://udacity-dend/log_data`
2. Transform in Spark—exploratory work in `notebook.ipynb`, production logic in `etl.py`
3. Write dimensional outputs (Parquet/CSV) to S3 for Redshift `COPY`, Athena, or the Airflow pipeline above

![](/images/project/processing-song-logs-spark-emr-s3/spark-etl-notebook.png)

![](/images/project/processing-song-logs-spark-emr-s3/spark-output-s3.png)

![](/images/project/processing-song-logs-spark-emr-s3/spark-cluster.png)

**Fact `songplays`** links plays to **dimensions** `users`, `songs`, `artists`, and `time`—deduped song/artist rows, parsed timestamps, filtered valid page views. Configuration via `dl.cfg` keeps lake paths out of hard-coded strings.

### Processing highlights

Most of the engineering effort sits in filtering noisy log events, aligning keys between logs and catalog rows, and exploding timestamps into a proper time dimension. The following behaviors define the star schema the Airflow/Redshift pipeline can consume later.

Log processing filters `page` values to song-play events, derives `user_id` from user-agent strings where needed, and joins to the song catalog on keys present in both datasets. Song processing selects artist and duration fields once per `song_id`. The time dimension normalizes timestamps into sortable year/month/day/hour columns so BI tools avoid repeated `date_part` expressions.

The notebook proves joins on sample paths; `etl.py` packages the same logic for `spark-submit` on EMR—matching the **notebook-first, script-second** workflow described in the EMR blog.

For cluster setup, deploy modes, and step submission, see [Big Data Jobs on EMR](/work/blogs/big-data-jobs-on-emr). This repository is the **implementation**; the blog is the **architecture and operations** guide.

## Tech stack

The project keeps compute, storage, and authoring surfaces separate: EMR runs the job, S3 holds inputs and outputs, and Python ties them together in notebook and script form.

| Layer | Tools |
|---|---|
| Processing | Apache Spark |
| Compute | AWS EMR |
| Storage | Amazon S3 |
| Languages | Python, Jupyter |

## Deployment notes

This case study reflects a development cluster, not an always-on production fleet—but the same submission model applies when scheduling EMR steps in a real environment. Two implementation choices matter for cost and downstream reuse.

Runs target an EMR cluster with Spark configured for S3A paths; output prefixes are chosen so a downstream Redshift `COPY` or the [Airflow music ETL](/work/projects/automating-music-etl-airflow-s3-redshift) DAG can consume the same star keys. Cluster screenshots in the repo document executor layout during development—not a production always-on cluster, but the same step submission model as the EMR blog.

Input JSON is nested and wide; Spark DataFrame APIs select only needed columns early to reduce shuffle cost before joins. Writes use Parquet where possible so later engines benefit from column pruning—cheaper than re-reading raw JSON for every analyst query.

## Impact

Beyond proving Spark can handle the Million Song volume, the repo shows how to graduate exploratory work into a repeatable batch job that feeds warehouse and lake consumers.

- **Scalable ETL** for JSON song + log volume beyond single-node pandas
- **Analytics-ready tables** instead of repeated full scans of raw files
- **Notebook → script path** for operational hardening before scheduling EMR steps

## What I would do next in production

A curriculum cluster proves the transform logic; production would add scheduling, observability, and catalog discovery so outputs are trustworthy without manual checks.

Schedule EMR steps from Airflow or EventBridge, add data tests on output row counts, and register the Parquet prefix in Glue or the catalog so Athena users discover tables without tribal knowledge.

## Links

Source code, notebook, and cluster screenshots live in the repository; the EMR blog covers how to stand up and submit jobs to the cluster.

- [GitHub — Using_Spark_emr_with_S3](https://github.com/ayotomiwasalau/Using_Spark_emr_with_S3)
- [Blog — Big Data Jobs on EMR](/work/blogs/big-data-jobs-on-emr)
