As at 2020, 6,000 tweets are generated per second — that's 104 billion bytes per day. Think about it. Imagine what it would be like today.

That's Big data!

![](/images/blog/distributed-computing-foundations/distributed_compute.webp)

Companies are looking for ways to harness the power of this data that is increasing exponentially; however, it's quite difficult to run processes on big data because it takes time.

Let's take a look at CPU, RAM (memory), disk, and network interaction.

A large streaming company might want to know which song is the most played in a particular location. As simple as this query is in SQL, it would take a hefty chunk of your project time to run the query on data running into terabytes, not to mention data science and ML processes.

> ##### To complete a process, the CPU moves data in batches from the disk to the RAM (based on size), to itself, then it begins processing for that batch. On completion, it returns the output to RAM while it takes in another batch. It then takes that processed output from the RAM and writes to disk.
> ##### It repeats this process for every batch and writes output to disk. When it's processing big data, after a while, processing starts slowing down. At this time, looking at your resource monitor, you would notice the CPU is barely 30% and RAM and disk would be close to 100%.

This is because of the time it takes to move data from the hard disk to RAM. The time it takes to move data from disk to RAM (memory) is about 100x longer than that of RAM to CPU, and moving data on a network takes the longest.

So while data is still coming from the disk, the CPU is done with that batch. Now there's a bottleneck between the disk and RAM, slowing down the work on big data. To conquer this, distributed computing was invented.

> ##### Distributed computing is basically using a network of computers (servers) to run your processes such as the query on the most played song. These network of computers are normally referred to as clusters or nodes, but on a basic level, they are a combination of CPU and RAM.

Understanding distributed computing: assuming you want to run a computational query on about 60GB, but the RAM (memory) capacity of your system is 4GB.

In order to save time, you split the data and send it to 14 colleagues to help you run that query, then you collate their output and present the result.

It works, but when the data becomes larger, that approach won't be effective, as it would take longer to send those larger bits over to your colleagues and collate. What a hassle.

Now, without needing to send your data to 14 computers, you can process your big data using technologies such as Apache Spark, Apache Hadoop (Hadoop MapReduce), Apache Flink, Apache Storm, and Kafka whose software run on clusters of commodity computers.

They help you process data on different computers/clusters/nodes/servers in unison. They also make use of a processing method called MapReduce and a programming methodology called functional programming, which makes the processing of big data faster and efficient.

> Apache Hadoop — The framework comes with a filing system for storage, HDFS, helps work distributedly on clusters, and has a MapReduce framework.\
> Apache Flink/Storm/Kafka is mainly for data streaming.\
> Apache Spark — It's a faster processor which uses the advanced MapReduce framework, doesn't have a filing system. It can be integrated into a filing system such as HDFS or Amazon S3.

Cloud companies such as AWS, Azure, and IBM also provide fast processing services using the above technologies on virtual computers/clusters to enable you to process your data in a distributed manner.
