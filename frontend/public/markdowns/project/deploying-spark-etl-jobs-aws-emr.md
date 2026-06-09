![](/images/project/deploying-spark-etl-jobs-aws-emr/sparkimg.png)

A music streaming startup stores **JSON song metadata and user logs in S3** but needs production-grade Spark jobs—not notebook-only prototypes. This project covers EMR cluster provisioning, Jupyter validation, packaged ETL, and deployment via console, CLI, and Boto3.

[GitHub — big-data-jobs](https://github.com/ayotomiwasalau/big-data-jobs) · [Architecture & design (blog)](/work/blogs/big-data-jobs-on-emr)

## Context

Exploratory notebooks do not survive production. The team needed a **star schema** ETL (fact `songplays` plus user/song/artist/time dimensions), logic validated in EMR Studio before packaging, and **repeatable deployment** through console, CLI, and Python SDK—with clear **client vs cluster** mode choices for reliability. Raw JSON in S3 had to become analyst-friendly Parquet without re-running fragile notebook cells on a schedule.

## Approach

The workflow moves from cluster provisioning through Jupyter validation to packaged `spark-submit` steps on EMR—three operator surfaces for the same job:

1. **Provision EMR** — Spark, Hadoop, Hive, Jupyter Enterprise Gateway, Livy; master + core instance groups with EBS.
2. **Develop in Jupyter** — Attach EMR Studio workspace to cluster; read song and log JSON from S3, build dimensional outputs interactively.
3. **Package job** — `spark_job_emr.py` with `process_song_data` and `process_log_data`; reads `s3://…/input/`, writes Parquet dimensions to output prefix.
4. **Upload & deploy** — Script to S3; submit via console Steps, `aws emr add-steps`, or `python_deploy.py` (Boto3 `run_job_flow` / `add_job_flow_steps`).
5. **Production mode** — Prefer **cluster** deploy mode so the driver stays on EMR; use client mode only for short dev runs.

![](/images/project/deploying-spark-etl-jobs-aws-emr/bigdata_create_cluster.png)

![](/images/project/deploying-spark-etl-jobs-aws-emr/bigdata_jupyter_notebook1.png)

![](/images/project/deploying-spark-etl-jobs-aws-emr/emr-steps-complete.png)

## Architecture breakdown

The ETL reads Million Song JSON and event-simulator logs from S3, writes dimensional Parquet, and targets the same star keys used in warehouse loads. Sources, schema, and deploy commands are summarized below.

### Data sources

| Source | Format | Notes |
|---|---|---|
| Song metadata | JSON (Million Song Dataset subset) | Partitioned by track ID prefix |
| App activity logs | JSON (eventsim simulator) | Date-partitioned play events |

### Target schema

| Type | Table |
|---|---|
| Fact | `songplays` |
| Dimensions | `users`, `songs`, `artists`, `time` |

### Deploy commands (summary)

```bash
# CLI: create cluster (Spark + Jupyter + Livy)
aws emr create-cluster --name "EMR Cluster" --release-label emr-7.8.0 \
  --applications Name=Spark Name=Hadoop Name=Hive Name=JupyterEnterpriseGateway Name=Livy ...

# Add ETL step (cluster mode for production)
aws emr add-steps --cluster-id <id> --steps Type=CUSTOM_JAR,Name="Spark Program",\
ActionOnFailure=CONTINUE,Jar=command-runner.jar,\
Args=[spark-submit,--deploy-mode,cluster,s3://.../spark_job_emr.py]
```

Repo also includes `cli_deploy.sh`, `python_deploy.py`, and exploratory `data-notebook.ipynb`.

![](/images/project/deploying-spark-etl-jobs-aws-emr/bigdata_s3.png)

![](/images/project/deploying-spark-etl-jobs-aws-emr/bigdata_output_file.png)

## Tech stack

Spark on EMR is the compute layer; S3 holds inputs and outputs; console, CLI, and Boto3 cover how different teams submit the same step.

| Layer | Tools |
|---|---|
| Processing | Apache Spark (PySpark) |
| Compute | AWS EMR |
| Storage | Amazon S3 |
| Deploy | AWS Console, AWS CLI, Boto3 |
| Development | Jupyter (EMR Studio) |

## Impact

The project bridges exploratory EMR notebooks and operable batch jobs—the same star-schema logic teams need before wiring Airflow or Redshift loads.

- **Notebook → production script** workflow with repeatable EMR steps
- **Three deploy paths** (UI, shell, programmatic) for different ops workflows
- **Analytics-ready Parquet** on S3 for Redshift, Athena, or Glue catalog consumption
- **Cluster-mode production runs** — driver on EMR survives client disconnects during long ETL jobs

## Links

Cluster scripts, notebook, and deploy helpers live in the repository; the blog documents EMR architecture and operations.

- [GitHub — big-data-jobs](https://github.com/ayotomiwasalau/big-data-jobs)
- [Blog — Big data jobs on EMR](/work/blogs/big-data-jobs-on-emr)
