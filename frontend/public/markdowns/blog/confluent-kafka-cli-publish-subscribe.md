![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-service-stack.png)

Before wiring Kafka into application code, it helps to prove the pipeline with the **command-line tools** — publish messages to a topic and read them back in another terminal. This walkthrough uses a local **Confluent Platform** stack (broker, Schema Registry, Control Center) and the built-in console producer and consumer.

## Getting started

1. Start the Kafka service stack (broker, Schema Registry, Connect, ksqlDB, Control Center)
2. Create a topic for test messages
3. Open a **console consumer** subscribed to the topic
4. Open a **console producer** and type JSON records
5. Confirm messages appear in the consumer and in Control Center

Here is the stack running locally:

![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-service-stack.png)

## Create a topic

Using the Kafka CLI (adjust bootstrap server for your setup):

```bash
kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic src.financials.purchases \
  --partitions 10 \
  --replication-factor 1
```

List topics to verify:

```bash
kafka-topics --list --bootstrap-server localhost:9092
```

## Subscribe with the console consumer

In one terminal, start a consumer from the beginning of the topic:

```bash
kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic src.financials.purchases \
  --from-beginning \
  --property print.timestamp=true
```

Leave this running — it prints each message as it arrives.

## Publish with the console producer

In a second terminal, start the producer on the same topic:

```bash
kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic src.financials.purchases
```

Type JSON lines (example financial purchase records generated with [Faker](https://faker.readthedocs.io/en/master/)):

```json
{"username": "jane_doe", "currency": "USD", "amount": 4200}
{"username": "john_smith", "currency": "EUR", "amount": 15800}
```

Each line is a separate Kafka record. You should see them appear immediately in the consumer terminal.

## Inspect in Control Center

Open Confluent Control Center to view topic throughput, partition lag, and message contents — useful before moving to programmatic producers and consumers.

![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-ui-0.png)

## What's next

Once pub/sub works from the CLI, the same topic can be accessed from application code. See [Confluent Kafka: Streaming Data with the Python SDK](/work/blogs/kafka-python-client-patterns) for async producer and consumer setup with the Python client.

## References

- [GitHub — confluent-kafka-projects](https://github.com/ayotomiwasalau/confluent-kafka-projects)
