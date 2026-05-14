![](/images/blog/kafka-python-client-patterns/kafka-data-streams.webp)

In the previous kafka [article](https://ayotomiwasalau.com/posts/confluent-kafka-publish-and-subscribe?id=46b23cd4-66cd-4112-8ce2-dc2389a3879b), we used commandline console to publish and subscribe to data, now we are going to use confluent python SDK to send and receive data stream. This is especially good when you have an application through which you want to publish or receive data

To get started, we:
- Setup the kafka service stack
- Define the schema and setup the topic
- Setup producer python lib
- Setup the consumer python lib
- Initiate both process

Here we have the kafka stack running - the broker, schema registry, connect, KSQL db, control center etc

![](/images/blog/kafka-python-client-patterns/kafka-service-stack.png)

We define our schema, we are receiving financial data generated using the [faker](https://faker.readthedocs.io/en/master/) library. The fields includes ```username```, ```currency``` and ```amount```

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

Next we setup up our topic name ```src.financials.purchases```

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

Then we initialize the producer to pushout data

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

This is the output from the producer

![](/images/blog/kafka-python-client-patterns/kafka-producer-scrnsht.png)


Afterwards, we setup the consumer to receive the data realtime

```python
async def consume(topic_name):
    """Consumes produced messages"""
    c = Consumer({"bootstrap.servers": BROKER_URL, "group.id": "0"})
    c.subscribe([topic_name])
    num_consumed=0
    while True:
        msg = c.consume(5,timeout=1)
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

Here we can see the data being received by the consumer

![](/images/blog/kafka-python-client-patterns/kafka-consumer-scrnsht.png)

When working with Kafka in Python, there are two primary approaches to producing and consuming event streams:

### Synchronous Processing

In synchronous mode, the producer or consumer waits for each operation to complete before moving on to the next one. This means:

- **Synchronous Producer:** Each message is sent, and the producer waits for an acknowledgment from the broker before sending the next message. This approach is simple and ensures delivery confirmation, but can be slower due to waiting for each round-trip. In the confluent python producer lib, we would use ```flush()``` to make sure all the data is sent and the acknowledgement is received

- **Synchronous Consumer:** The consumer fetches messages one at a time (or in small batches), processes them, and then commits the offset before fetching more. This can make error handling and message ordering straightforward, but may limit throughput. In the confluent python consumer lib, we would use ```commit()``` to commit before receiving more events.

### Asynchronous Processing

- **Asynchronous Producer:** Messages are sent without blocking, allowing the producer to continue sending while previous messages are being acknowledged. This approach uses callbacks for delivery confirmation and can batch multiple messages together for better throughput. In the confluent python producer lib, we would use ```poll()``` to push event without waiting explicitly for acknowledgement. Python asyncio library enable us to implement the asynchronous processing

- **Asynchronous Consumer:** Processes messages without blocking on each individual message. Can handle multiple messages concurrently and use batch processing for improved performance. In the confluent python consumer lib, we would use ```commit(asynchronous=True)``` to commit asynchronous while receiving new events

For this project we use the async approach because it enables high throughput


We can also navigate to the control center to view the data in topic

![](/images/blog/kafka-python-client-patterns/kafka-ui-0.png)

![](/images/blog/kafka-python-client-patterns/kafka-ui-1.png)


This wraps up using python confluent library to set up your producer and consumer

### Reference
- [Github](https://github.com/ayotomiwasalau/confluent-kafka-projects)


