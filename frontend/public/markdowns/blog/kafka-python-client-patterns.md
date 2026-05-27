![](/images/blog/kafka-python-client-patterns/kafka-data-streams.webp)

In the previous [Kafka CLI article](/work/blogs/confluent-kafka-cli-publish-subscribe), we published and subscribed using the console tools. Here we use the **Confluent Python SDK** to send and receive data streams from an application — the pattern you need when Kafka is embedded in production code rather than tested manually.

## Getting started

1. Set up the Kafka service stack
2. Define the schema and create the topic
3. Implement the producer (Python)
4. Implement the consumer (Python)
5. Run both processes and verify in Control Center

Here is the Kafka stack running — broker, Schema Registry, Connect, ksqlDB, Control Center, and related services:

![](/images/blog/kafka-python-client-patterns/kafka-service-stack.png)

We define a schema for financial data generated with the [Faker](https://faker.readthedocs.io/en/master/) library. Fields include `username`, `currency`, and `amount`:

```python
@dataclass
class Purchase:
    username: str = field(default_factory=faker.user_name)
    currency: str = field(default_factory=faker.currency_code)
    amount: int = field(default_factory=lambda: random.randint(100, 200000))

    def serialize(self):
        """Serializes the object in JSON string format"""
        return json.dumps(
            {
                "username": self.username,
                "currency": self.currency,
                "amount": self.amount,
            }
        )
```

Create the topic `src.financials.purchases`:

```python
def create_topic(client, topic_name):
    """Creates the topic with the given topic name"""
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
        try:
            future.result()
            print("topic created")
        except Exception as e:
            print(f"failed to create topic {topic_name}: {e}")
```

Initialize the producer to push data:

```python
async def produce(topic_name):
    """Produces data into the Kafka Topic"""
    p = Producer({"bootstrap.servers": BROKER_URL})
    i = 0
    starttime = datetime.utcnow()
    while True:
        for _ in range(10):
            purchase = Purchase()
            message = purchase.serialize()
            timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
            p.produce(topic_name, message)
            print(f"[{timestamp}] Produced message: {message}")
        p.poll(0)
        if i % 10 == 0:
            elapse = datetime.utcnow() - starttime
            print(f"Total produced: {i}, time - {elapse}")
        i += 1

        await asyncio.sleep(0.01)
```

Producer output:

![](/images/blog/kafka-python-client-patterns/kafka-producer-scrnsht.png)

Set up the consumer to receive data in near real time:

```python
async def consume(topic_name):
    """Consumes produced messages"""
    c = Consumer({"bootstrap.servers": BROKER_URL, "group.id": "0"})
    c.subscribe([topic_name])
    num_consumed = 0
    while True:
        msg = c.consume(5, timeout=1)
        if msg:
            num_consumed += 1
            for message in msg:
                timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
                print(f"[{timestamp}] Consumed message: {message.value()}")
            if num_consumed % 10 == 0:
                print(f"Total consumed: {num_consumed} messages")
        else:
            await asyncio.sleep(0.01)
        c.commit(asynchronous=True)
```

Consumer output:

![](/images/blog/kafka-python-client-patterns/kafka-consumer-scrnsht.png)

## Synchronous vs asynchronous processing

When working with Kafka in Python, there are two primary approaches:

### Synchronous processing

- **Producer:** Each message is sent and the producer waits for broker acknowledgment before sending the next. Simple and reliable; use `flush()` to ensure delivery.
- **Consumer:** Fetches and processes messages one batch at a time, committing offsets before fetching more. Straightforward error handling; use `commit()` before receiving new events.

### Asynchronous processing

- **Producer:** Messages are sent without blocking; `poll()` pushes events while acknowledgments arrive in the background. Higher throughput with batching.
- **Consumer:** Processes without blocking on each message; use `commit(asynchronous=True)` while continuing to poll.

This project uses the **async approach** for higher throughput, with Python's `asyncio` coordinating producer and consumer loops.

## Control Center

Navigate to Control Center to inspect topic data, consumer lag, and throughput:

![](/images/blog/kafka-python-client-patterns/kafka-ui-0.png)

![](/images/blog/kafka-python-client-patterns/kafka-ui-1.png)

## References

- [GitHub — confluent-kafka-projects](https://github.com/ayotomiwasalau/confluent-kafka-projects)
- [Previous — Confluent Kafka CLI pub/sub](/work/blogs/confluent-kafka-cli-publish-subscribe)
