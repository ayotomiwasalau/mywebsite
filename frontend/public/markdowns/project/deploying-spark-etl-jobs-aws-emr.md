![](/images/project/deploying-spark-etl-jobs-aws-emr/hero.jpg)

A music streaming startup stores **JSON song metadata and user logs in S3** but needs production-grade Spark jobs — not just notebook prototypes. This project covers the full path from **EMR cluster setup through Spark ETL to deployment via console, CLI, and Boto3**.

## Problem

Exploratory notebooks do not survive production. The team needed:

- A **star schema** ETL (fact `songplays` + user/song/artist/time dimensions)
- **Validated logic** in EMR Studio Jupyter before packaging as `spark_job_emr.py`
- **Three deployment paths**: AWS Console, AWS CLI, and Python SDK
- Clear understanding of **client vs cluster** deploy modes for reliability

## Solution

Spark ETL on EMR ([GitHub — big-data-jobs](https://github.com/ayotomiwasalau/big-data-jobs)):

1. **Provision EMR** — Spark, Hadoop, Hive, Jupyter, Livy; sized primary/core/task groups
2. **Develop in Jupyter** — read Million Song Dataset + event-sim logs from S3, build dimensional outputs
3. **Package job** — `spark_job_emr.py` reads `s3://data-emr-bucket-store/.../input/`, writes dimensional tables to output prefix
4. **Deploy** — console steps, `aws emr add-steps`, or `python_deploy.py` with Boto3

![](/images/project/deploying-spark-etl-jobs-aws-emr/bigdata_create_cluster.png)

![](/images/project/deploying-spark-etl-jobs-aws-emr/bigdata_jupyter_notebook1.png)

![](/images/project/deploying-spark-etl-jobs-aws-emr/emr-steps-complete.png)

## Architecture breakdown

### Data sources

- **Song data** — JSON metadata partitioned by track ID prefix (Million Song Dataset subset)
- **Log data** — date-partitioned JSON app events from the eventsim simulator

### Target schema

| Type | Table |
|---|---|
| Fact | `songplays` |
| Dimensions | `users`, `songs`, `artists`, `time` |

### Deployment modes

- **Client mode** — driver on submitter; good for dev, fragile for long jobs
- **Cluster mode** — driver on EMR; preferred for production steps

Repo includes `cli_deploy.sh`, `python_deploy.py`, and the exploratory `data-notebook.ipynb`.

![](/images/project/deploying-spark-etl-jobs-aws-emr/bigdata_s3.png)

![](/images/project/deploying-spark-etl-jobs-aws-emr/bigdata_output_file.png)

## Tech stack

| Layer | Tools |
|---|---|
| Processing | Apache Spark |
| Compute | AWS EMR |
| Storage | Amazon S3 |
| Deploy | AWS Console, AWS CLI, Boto3 |
| Dev | Jupyter (EMR Studio) |

## Impact

- **Notebook → production script** workflow with repeatable EMR steps
- **Multiple deploy options** for ops teams (UI, shell, programmatic)
- **Analytics-ready S3 outputs** for downstream Redshift or Athena consumption

## Links

- [GitHub — big-data-jobs](https://github.com/ayotomiwasalau/big-data-jobs)
- [Blog — Big data jobs on EMR](/posts/big-data-jobs-on-emr)
