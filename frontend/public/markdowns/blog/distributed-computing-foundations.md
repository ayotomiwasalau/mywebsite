![](/images/blog/distributed-computing-foundations/schema-kafka-hadoop-spark.webp)

As of 2020, about **6,000 tweets were generated per second**—roughly **104 billion bytes per day**. That volume is far higher now.

That's **big data**.

Companies want to harness it, but running processes on data at that scale is slow. To see why, look at how **CPU**, **RAM (memory)**, **disk**, and **network** work together.

## The single-machine bottleneck

A large streaming company might want to know which song is most played in a given location. In SQL that query is simple, but on **terabytes** of data it can consume a huge share of project time—the same pain hits data science and ML workloads.

> To complete a process, the CPU moves data in batches from disk to RAM (based on size), then into the CPU for processing. When a batch finishes, output goes back to RAM while the CPU takes the next batch. Processed output is written to disk. The cycle repeats for every batch.
>
> On big data, processing eventually slows even though the CPU looks idle: often **CPU is barely ~30%** while **RAM and disk are close to 100%**.

That happens because moving data from disk to RAM takes about **100× longer** than RAM to CPU, and moving data over a **network** takes longest. The CPU finishes a batch while the next batch is still loading from disk—a **disk–RAM bottleneck**, not weak compute.

> **Distributed computing** uses a network of computers (servers)—**clusters** or **nodes**—to run work such as that “most played song” query. At a basic level, each node is CPU plus RAM working in parallel.

## Splitting work by hand (and why frameworks exist)

Say you need to run a query on **~60 GB** of data but your machine has only **4 GB** of RAM.

You could split the data, send chunks to **14 colleagues**, each runs the query locally, and you collate the results. That works in principle—but as data grows, shipping chunks and merging outputs becomes the bottleneck. It does not scale.

Frameworks avoid that manual shuffle. Technologies such as **Apache Spark**, **Apache Hadoop** (Hadoop MapReduce), **Apache Flink**, **Apache Storm**, and **Apache Kafka** run on **clusters of commodity machines**. They process data across nodes in unison, using **MapReduce**-style patterns and **functional programming** ideas so big jobs stay faster and easier to reason about.

> **Apache Hadoop** — Includes **HDFS** for distributed storage and a **MapReduce** framework for batch jobs on clusters.
>
> **Apache Flink / Storm / Kafka** — Flink and Storm focus on **stream processing**; Kafka is the durable **event log** that connects producers and consumers at scale.
>
> **Apache Spark** — A faster in-memory engine with an advanced MapReduce-style execution model. Spark does not ship its own long-term file system; it integrates with **HDFS**, **Amazon S3**, and other stores.

Cloud providers (**AWS**, **Azure**, **IBM**, and others) offer managed clusters built on these runtimes—**EMR**, **HDInsight**, **Dataproc**, and similar—so you process data distributedly on virtual machines without operating bare-metal fleets yourself.

## MapReduce and functional programming

**MapReduce** breaks work into **map** (per partition), **shuffle** (group by key), and **reduce** (aggregate). **Functional programming**—immutable transforms, composable stages—helps runtimes **re-run failed partitions** after a node drops.

Spark, Flink, and Kafka each apply that thinking differently: Spark on batch and structured streaming, Flink on low-latency stateful streams, Kafka on partitioned logs and parallel consumer groups.

## Closing thought

Big data is less about raw CPU speed and more about **how often data crosses disk, RAM, and network**. Distributed systems exist to parallelize that movement and computation—so a terabyte query or training job finishes in hours on a cluster instead of days on one overloaded machine.

For a hands-on Spark path on AWS, see [Big Data Jobs on EMR](/work/blogs/big-data-jobs-on-emr). For moving events between services, see [Confluent Kafka CLI publish/subscribe](/work/blogs/confluent-kafka-cli-publish-subscribe).
