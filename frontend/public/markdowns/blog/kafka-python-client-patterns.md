![](/images/blog/kafka-python-client-patterns/kafka-ui-1.png)

## System overview

After you [prove pub/sub from the CLI](/work/blogs/confluent-kafka-cli-publish-subscribe), the next step is embedding Kafka inside application code. Console producers are fine for smoke tests; production services need programmatic producers and consumers with clear delivery semantics, consumer groups, and throughput tuning.

This article walks through an **async producer and consumer** design using the **Confluent Python SDK** (`confluent-kafka`): define a JSON schema for synthetic financial purchases, create a partitioned topic, publish in a tight loop with `poll()`, and consume in batches with `commit(asynchronous=True)`. The same topic naming (`src.financials.purchases`) aligns with the CLI walkthrough and with JVM streaming work in the [POS terminal Kafka Streams case study](/work/projects/streaming-pos-terminal-data-kafka-java).

## Prerequisites

Run the Confluent Platform stack locally (broker, Schema Registry, Connect, ksqlDB, Control Center). The companion repo [confluent-kafka-projects](https://github.com/ayotomiwasalau/confluent-kafka-projects) mirrors this layout. Python 3.x plus `confluent-kafka` and `asyncio` are required on the host; the broker bootstrap URL typically points at `localhost:9092` or the Docker service name `broker:9092`.

If you have not started the stack yet, complete the [CLI walkthrough](/work/blogs/confluent-kafka-cli-publish-subscribe) first — you will reuse the same broker endpoints and topic naming conventions, which reduces environment drift when switching from console tools to SDK code.

![](/images/blog/kafka-python-client-patterns/kafka-service-stack.png)

## Schema and topic design

Events represent purchases generated with [Faker](https://faker.readthedocs.io/en/master/): `username`, `currency`, and `amount`. A dataclass keeps generation and serialization in one place; JSON keeps the example simple without Avro tooling (Schema Registry can enforce Avro or Protobuf in production).

```python
@dataclass
class Purchase:
    username: str = field(default_factory=faker.user_name)
    currency: str = field(default_factory=faker.currency_code)
    amount: int = field(default_factory=lambda: random.randint(100, 200000))

    def serialize(self):
        return json.dumps(
            {
                "username": self.username,
                "currency": self.currency,
                "amount": self.amount,
            }
        )
```

Create topic `src.financials.purchases` with **10 partitions** for parallel consumers, **replication factor 1** for local dev, and topic configs tuned for throughput (`lz4` compression, delete cleanup). Partition count should match expected consumer parallelism; under-partitioning becomes a ceiling on scale.

```python
def create_topic(client, topic_name):
    futures = client.create_topics(
        [
            NewTopic(
                topic=topic_name,
                num_partitions=10,
                replication_factor=1,
                config={
                    "cleanup.policy": "delete",
                    "compression.type": "lz4",
                    "delete.retention.ms": "2000",
                    "file.delete.delay.ms": "2000",
                },
            )
        ]
    )
    for topic, future in futures.items():
        future.result()
```

## Async producer design

The producer loop builds ten `Purchase` records per iteration, calls `produce()` without blocking on each ack, then `poll(0)` to drive the internal librdkafka queue. `asyncio.sleep(0.01)` yields the event loop so producer and consumer coroutines can run concurrently in one process or separate terminals.

```python
async def produce(topic_name):
    p = Producer({"bootstrap.servers": BROKER_URL})
    i = 0
    starttime = datetime.utcnow()
    while True:
        for _ in range(10):
            purchase = Purchase()
            message = purchase.serialize()
            p.produce(topic_name, message)
        p.poll(0)
        if i % 10 == 0:
            elapse = datetime.utcnow() - starttime
            print(f"Total produced: {i}, time - {elapse}")
        i += 1
        await asyncio.sleep(0.01)
```

**Design notes:** batching inside the loop amortizes syscall overhead; `poll(0)` is mandatory in the Confluent client or callbacks and buffers stall. For guaranteed flush on shutdown, call `flush()` before exit. In production, add error callbacks on `produce()` and monitor broker latency.

![](/images/blog/kafka-python-client-patterns/kafka-producer-scrnsht.png)

## Async consumer design

The consumer subscribes with a **consumer group** (`group.id`), pulls up to five messages per `consume()` call with a one-second timeout, and commits offsets asynchronously so polling continues while commits complete.

```python
async def consume(topic_name):
    c = Consumer({"bootstrap.servers": BROKER_URL, "group.id": "0"})
    c.subscribe([topic_name])
    num_consumed = 0
    while True:
        msg = c.consume(5, timeout=1)
        if msg:
            num_consumed += len(msg)
            for message in msg:
                print(f"Consumed message: {message.value()}")
        else:
            await asyncio.sleep(0.01)
        c.commit(asynchronous=True)
```

**Design notes:** batch consumption improves throughput versus one-record polls. Choose `group.id` per logical application; duplicate groups on the same topic cause partition rebalancing. Handle deserialization errors and poison pills with a dead-letter strategy before production cutover.

![](/images/blog/kafka-python-client-patterns/kafka-consumer-scrnsht.png)

## Synchronous vs asynchronous semantics

| Mode | Producer | Consumer |
|---|---|---|
| Synchronous | `produce()` then `flush()` per batch; waits for broker ack | `commit()` before next poll; simpler ordering guarantees |
| Asynchronous | `produce()` + `poll(0)`; higher throughput | `commit(asynchronous=True)` while continuing to read |

This project favors **async** paths for throughput demos. Payment or audit pipelines may prefer synchronous commits until idempotent producers and exactly-once processing are configured.

## Observability in Control Center

Control Center validates end-to-end flow without custom metrics: topic byte rate, partition skew, consumer lag, and message inspection.

![](/images/blog/kafka-python-client-patterns/kafka-ui-0.png)

## Python vs JVM for streaming

Python excels at rapid prototyping and data science adjacency; **Kafka Streams** and heavy transformation logic are usually implemented in **Java or Scala** (see the [POS streaming project](/work/projects/streaming-pos-terminal-data-kafka-java)). A common pattern: Python producers land raw events; JVM stream jobs aggregate and fan out to analytics topics.

## Design decisions

**JSON payloads for learning** — fast to read in logs; migrate to Schema Registry + Avro when contracts matter. Keys on `username` would co-locate a user's purchases in one partition if you later need per-user ordering.

**High partition count early** — cheaper to over-partition in dev than to repartition under load later.

**Async commit in the consumer** — trades a small risk of duplicate processing on failure for lower lag; pair with idempotent sinks.

## Trade-offs

| Pros | Cons |
|---|---|
| Simple asyncio concurrency model | Python Kafka Streams support is limited vs Java |
| Confluent client wraps librdkafka performance | Async commits need idempotent downstream writes |
| Reuses CLI topic and schema | Local RF=1 is not production fault tolerance |

## Scaling considerations

Increase **partition count** when consumer lag grows with traffic. Tune `linger.ms` and `batch.size` on the producer for throughput; run multiple consumers sharing one **group.id** to balance partitions. Enable **idempotent producer** settings when you must avoid duplicate writes during broker failover.

## What's next

- Add **Schema Registry** validation for purchase records
- Wire **metrics** (Prometheus/JMX) and alert on consumer lag
- Compare with **Java Kafka Streams** in the POS case study

## Running producer and consumer together

Start the consumer coroutine first so it does not miss the earliest burst, then launch the producer. In development, two terminals with separate scripts are easier to read than one combined process; in production, deploy them as independent services so you can scale consumers without touching producers.

## References

- [GitHub — confluent-kafka-projects](https://github.com/ayotomiwasalau/confluent-kafka-projects)
- [Confluent Kafka CLI publish/subscribe](/work/blogs/confluent-kafka-cli-publish-subscribe)
- [POS terminal streaming — Java Kafka Streams](/work/projects/streaming-pos-terminal-data-kafka-java)
