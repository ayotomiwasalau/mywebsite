![](/images/blog/big-data-jobs-on-emr/bigdata_cluster_config.png)

A growing music streaming startup has expanded its user base and song library and now needs to load analytics-ready data into its warehouse. Song metadata and user activity logs live as **JSON in Amazon S3**. The goal is an **ETL** job that extracts that data, processes it with **Apache Spark**, and writes **dimensional tables** back to S3 so the analytics team can keep finding insights in what users are listening to.

[GitHub — big-data-jobs](https://github.com/ayotomiwasalau/big-data-jobs) · [Project case study](/work/projects/deploying-spark-etl-jobs-aws-emr)

**Tools:** AWS Elastic MapReduce (EMR), Apache Spark, Bash, Python.

**Steps covered:** set up a Spark cluster · write transformation logic · deploy via AWS console · deploy via CLI · deploy via Python AWS SDK (Boto3).

## Dataset

The first dataset is a subset of the [Million Song Dataset](http://millionsongdataset.com/). Each file is JSON with song and artist metadata, partitioned by the first three letters of each track ID.

The second dataset is JSON **log files** from this [event simulator](https://github.com/Interana/eventsim), which mimics app activity for an imaginary streaming service based on the songs above.

Together they feed a **star schema**: fact `songplays` plus dimensions for users, songs, artists, and time—written as Parquet under an S3 output prefix.

## Set up your Spark cluster

You can run Spark on a local machine (download binaries, tune memory and cores, scale up hardware when data grows) or on a **managed cloud cluster** with Spark, Hadoop, HDFS, ZooKeeper, Livy, and related services preinstalled. Cloud saves setup time at per-minute cost.

This project uses **AWS EMR**. You can create a cluster through the **console**, **CLI**, or **SDK**. Below is the console walkthrough.

### Create cluster (AWS console)

1. Click **Create cluster**.

![](/images/blog/big-data-jobs-on-emr/bigdata_create_cluster.png)

2. Select services on EMR. Besides Spark you can add Flink, Trino, Presto, and more. For this ETL, choose **Spark** plus supporting apps such as Hadoop, HDFS, ZooKeeper, and Livy.

![](/images/blog/big-data-jobs-on-emr/bigdata_cluster_config.png)

3. Pick instance groups. Spark runs distributed: a **master** (driver) and **workers** (executors). On EMR these are **primary**, **core**, and **task** nodes—the driver schedules work on executors.

![](/images/blog/big-data-jobs-on-emr/bigdata_instance_type.png)

4. Set EBS disk size (for example 15 GB per node).

![](/images/blog/big-data-jobs-on-emr/bigdata_root_vol.png)

5. Choose IAM roles—defaults are fine unless you have special requirements.

![](/images/blog/big-data-jobs-on-emr/bigdata_def_roles.png)

6. Pick VPC and subnet for the cluster.

![](/images/blog/big-data-jobs-on-emr/bigdata_network.png)

7. Leave remaining settings as default and launch.

![](/images/blog/big-data-jobs-on-emr/bigdata_cluster_launch.png)

8. Wait for setup to finish. A healthy cluster reaches **Waiting**; otherwise check the error details on the cluster page.

![](/images/blog/big-data-jobs-on-emr/bigdata_process1.png)

![](/images/blog/big-data-jobs-on-emr/bigdata_processcomplete.png)

## Write the data processing logic

Prototype the ETL on a **small data subset** in a **Jupyter notebook** before production deployment. Notebooks give fast feedback so you fix bugs before submitting cluster steps.

On EMR, open **EMR Studio**, create a studio and workspace if needed, attach the cluster, and run Jupyter (Jupyter Enterprise Gateway was included when you created the cluster).

![](/images/blog/big-data-jobs-on-emr/bigdata_jupyter.png)

The notebook builds a **dimensional model** from raw music data—songs, artists, time, songplays, and related entities.

- Import raw song data from S3 (or another path).

![](/images/blog/big-data-jobs-on-emr/bigdata_jupyter_notebook1.png)

- Clean columns and remove duplicates.

![](/images/blog/big-data-jobs-on-emr/bigdata_jupyter2.png)

- Partition and write processed data to S3.

![](/images/blog/big-data-jobs-on-emr/bigdata_jupyter3.png)

- Repeat for the log datasets.

![](/images/blog/big-data-jobs-on-emr/bigdata_jupyter4.png)

Subset output lands in S3:

![](/images/blog/big-data-jobs-on-emr/bigdata_output_file.png)

## Deploy using the AWS console

Notebooks suit exploration; **scheduled or large jobs** should run as **EMR steps**. Convert notebook logic into a modular script such as `spark_job_emr.py`:

```python
import configparser
from datetime import datetime
import os
from pyspark.sql import SparkSession
from pyspark.sql.functions import udf, col
from pyspark.sql.functions import year, month, dayofmonth, hour, weekofyear, date_format
from pyspark.sql.types import TimestampType
from pyspark.sql.functions import monotonically_increasing_id


def create_spark_session():
    spark = SparkSession \
        .builder \
        .config("spark.jars.packages", "org.apache.hadoop:hadoop-aws:2.7.0") \
        .getOrCreate()
    return spark


def process_song_data(spark, input_data, output_data):
    """
    Args:
        spark - Spark session
        input_data - Data source location (Amazon S3)
        output_data - Data output location (Amazon S3)
    """
    song_data_path = os.path.join(input_data, "song-data/*/*/*/*/*.json")
    song_data = spark.read.json(song_data_path)

    songs_table = song_data["song_id", "title", "artist_id", "year", "duration", "artist_name"]
    songs_table = songs_table.drop_duplicates(subset=["song_id"])
    songs_table.write.partitionBy("year", "artist_id").parquet(
        os.path.join(output_data, "songs_table.parquet"), "overwrite"
    )

    artists_table = song_data[
        "artist_id", "artist_name", "artist_location", "artist_latitude", "artist_longitude"
    ]
    artists_table.write.parquet(os.path.join(output_data, "artists_table.parquet"), "overwrite")


def main():
    spark = create_spark_session()
    input_data = "s3://data-emr-bucket-store/deploy-on-console/input/"
    output_data = "s3://data-emr-bucket-store/deploy-on-console/output/"

    process_song_data(spark, input_data, output_data)
    process_log_data(spark, input_data, output_data)

    spark.stop()
    print("Process completed successfully.")


if __name__ == "__main__":
    main()
```

Upload the script to S3:

![](/images/blog/big-data-jobs-on-emr/bigdata_s3.png)

On the cluster page, open **Steps** and add one or more transformation steps:

![](/images/blog/big-data-jobs-on-emr/bigdata_step_init.png)

Configure the Spark step (script URI, deploy mode, failure action):

![](/images/blog/big-data-jobs-on-emr/bigdata_steps_config.png)

### Client mode vs cluster mode

**Client mode** — the Spark driver runs on the machine that submits the job (laptop or edge node). Good for development and quick iteration; if that machine disconnects, the job can fail.

**Cluster mode** — the driver runs on a cluster node. The job keeps running after the client disconnects; the driver schedules tasks on executors. Prefer **cluster mode** for production ETL.

![](/images/blog/big-data-jobs-on-emr/bigdata_steps_config2.png)

![](/images/blog/big-data-jobs-on-emr/bigdata_steps_running.png)

![](/images/blog/big-data-jobs-on-emr/bigdata_steps_complete.png)

Dimensional Parquet output appears under your S3 output prefix:

![](/images/blog/big-data-jobs-on-emr/bigdata_output_file.png)

## Deploy using the AWS CLI

Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) if needed.

Create an EMR cluster with Spark, Hadoop, Hive, Jupyter, and Livy:

```bash
aws emr create-cluster \
    --name "EMR Cluster" \
    --release-label "emr-7.8.0" \
    --use-default-roles \
    --applications Name=Hadoop Name=Hive Name=JupyterEnterpriseGateway Name=Livy Name=Spark \
    --ec2-attributes SubnetId="subnet-eef49ca3" \
    --instance-type m5.xlarge \
    --instance-count 2 \
    --scale-down-behavior "TERMINATE_AT_TASK_COMPLETION" \
    --auto-termination-policy IdleTimeout=3600 \
    --region "us-east-1" \
    --profile manager
```

Add the ETL script as a step (replace `cluster-id` with yours):

```bash
aws emr add-steps \
    --cluster-id j-32ZWBLZK82C9W \
    --steps Type=CUSTOM_JAR,Name="Spark Program",ActionOnFailure=CONTINUE,Jar="command-runner.jar",Args=["spark-submit","--deploy-mode","client","s3://data-emr-bucket-store/deploy-on-console/spark_job_emr.py"] \
    --region "us-east-1" \
    --profile manager

aws emr add-steps \
    --cluster-id j-32ZWBLZK82C9W \
    --steps Type=CUSTOM_JAR,Name="Spark Program",ActionOnFailure=CONTINUE,Jar="command-runner.jar",Args=["spark-submit","--deploy-mode","cluster","s3://data-emr-bucket-store/deploy-on-console/spark_job_emr.py"] \
    --region "us-east-1" \
    --profile manager
```

Create the cluster and run the step in one command:

```bash
aws emr create-cluster \
 --name "notebookCluster" \
 --log-uri "s3://aws-logs-189128986856-us-east-1/elasticmapreduce" \
 --release-label "emr-7.8.0" \
 --service-role "arn:aws:iam::189128986856:role/EMR_DefaultRole" \
 --unhealthy-node-replacement \
 --ec2-attributes '{"InstanceProfile":"EMR_EC2_DefaultRole","EmrManagedMasterSecurityGroup":"sg-04b24b0b1e921adf7","EmrManagedSlaveSecurityGroup":"sg-0cd31e5349681a2c2","AdditionalMasterSecurityGroups":[],"AdditionalSlaveSecurityGroups":[],"SubnetIds":["subnet-eef49ca3"]}' \
 --applications Name=Hadoop Name=Hive Name=JupyterEnterpriseGateway Name=Livy Name=Spark \
 --instance-groups '[{"InstanceCount":1,"InstanceGroupType":"MASTER","Name":"Primary","InstanceType":"m5.xlarge","EbsConfiguration":{"EbsBlockDeviceConfigs":[{"VolumeSpecification":{"VolumeType":"gp2","SizeInGB":32},"VolumesPerInstance":2}]}},{"InstanceCount":1,"InstanceGroupType":"CORE","Name":"Core","InstanceType":"m5.xlarge","EbsConfiguration":{"EbsBlockDeviceConfigs":[{"VolumeSpecification":{"VolumeType":"gp2","SizeInGB":32},"VolumesPerInstance":2}]}}]' \
 --steps '[{"Name":"jobcluster","ActionOnFailure":"CONTINUE","Jar":"command-runner.jar","Properties":"","Args":["spark-submit","--deploy-mode","cluster","s3://data-emr-bucket-store/deploy-on-console/spark_job_emr.py"],"Type":"CUSTOM_JAR"}]' \
 --scale-down-behavior "TERMINATE_AT_TASK_COMPLETION" \
 --auto-termination-policy '{"IdleTimeout":3600}' \
 --region "us-east-1"
```

## Deploy using the Python AWS SDK (Boto3)

`boto3` can upload the script to S3, create the cluster, and attach steps—either in one `run_job_flow` call or after the cluster is up.

```python
import boto3
import os
import configparser

config = configparser.ConfigParser()
config.read("dl.cfg")

os.environ["AWS_ACCESS_KEY_ID"] = config["AWS"]["AWS_ACCESS_KEY_ID"]
os.environ["AWS_SECRET_ACCESS_KEY"] = config["AWS"]["AWS_SECRET_ACCESS_KEY"]

session = boto3.Session(
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
)
client = session.client("emr")

S3_BUCKET = "data-emr-bucket-store"
S3_KEY = "deploy-on-console/python/spark_job_emr.py"

s3 = session.resource("s3")
s3.meta.client.upload_file("spark_job_emr.py", S3_BUCKET, S3_KEY)

response = client.run_job_flow(
    Name="EMR cluster - python deployment",
    ReleaseLabel="emr-7.8.0",
    Instances={
        "InstanceGroups": [
            {
                "Name": "Master node",
                "Market": "ON_DEMAND",
                "InstanceRole": "MASTER",
                "InstanceType": "m5.xlarge",
                "InstanceCount": 1,
            },
            {
                "Name": "Core nodes",
                "Market": "ON_DEMAND",
                "InstanceRole": "CORE",
                "InstanceType": "m5.xlarge",
                "InstanceCount": 1,
            },
        ],
        "KeepJobFlowAliveWhenNoSteps": False,
        "TerminationProtected": False,
    },
    Applications=[{"Name": "Spark"}],
    Steps=[
        {
            "Name": "Spark Program",
            "ActionOnFailure": "CONTINUE",
            "HadoopJarStep": {
                "Jar": "command-runner.jar",
                "Args": [
                    "spark-submit",
                    "--deploy-mode",
                    "client",
                    "s3://data-emr-bucket-store/deploy-on-console/spark_job_emr.py",
                ],
            },
        }
    ],
    VisibleToAllUsers=True,
    JobFlowRole="EMR_EC2_DefaultRole",
    ServiceRole="EMR_DefaultRole",
)

job_flow_id = response["JobFlowId"]
print("Job flow ID:", job_flow_id)

step_response = client.add_job_flow_steps(
    JobFlowId=job_flow_id,
    Steps=[
        {
            "Name": "Spark Program",
            "ActionOnFailure": "CONTINUE",
            "HadoopJarStep": {
                "Jar": "command-runner.jar",
                "Args": [
                    "spark-submit",
                    "--deploy-mode",
                    "cluster",
                    "s3://data-emr-bucket-store/deploy-on-console/spark_job_emr.py",
                ],
            },
        }
    ],
)

print("Step IDs:", step_response["StepIds"])
```

That covers console, CLI, and SDK deployment for the same `spark_job_emr.py` artifact in S3.

## Design notes

**Notebook-first, script-second** — validate joins and deduplication in EMR Studio; production runs use a versioned script and EMR steps so jobs are schedulable and reviewable in git.

**S3 as source and sink** — JSON in, partitioned Parquet out; clusters can terminate while data stays in S3 for Redshift, Athena, or Glue.

**One script, three deploy paths** — Console teaches the step model; CLI fits runbooks; Boto3 fits CI/CD or orchestrators.

| Pros | Cons |
|---|---|
| Elastic distributed processing on demand | Cluster cost if idle termination is misconfigured |
| Managed Spark/Hadoop versions | Cold start for new clusters |
| Star schema ready for warehouse load | VPC, subnet, and IAM setup upfront |
| Multiple deploy surfaces | JSON schema drift is costly at full scale |

**Scaling** — Partition log input by date in S3; use spot task nodes for executors; trigger `add-steps` from Airflow or EventBridge for daily runs. Watch for skewed keys, small Parquet files, and driver OOM from collecting too much data to the driver.

## Media and links

- [Project repository](https://github.com/ayotomiwasalau/big-data-jobs)
- [Project case study](/work/projects/deploying-spark-etl-jobs-aws-emr)
- [YouTube — long-form walkthrough](https://youtu.be/7FKkXiMRV9E?si=7wCoeWX48ivf51HM)
- [TikTok](https://www.tiktok.com/@ayotomiwasalau)
- [Instagram reel](https://www.instagram.com/reel/DJRQI1_oRen)
- [X thread](https://x.com/ayotomiwasalau)
