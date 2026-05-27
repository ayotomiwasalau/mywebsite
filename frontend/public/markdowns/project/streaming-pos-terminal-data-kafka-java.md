![](/images/project/streaming-pos-terminal-data-kafka-java/kafka-streams-hero.webp)

Retail analytics often lag behind sales — batch files land hours later. This project streams **POS terminal transaction JSON** to an analytics client in **near real time** using **Apache Kafka** and Java.

## Problem

Multiple point-of-sale terminals write transaction JSON to a datastore. Downstream analytics need:

- **Immediate visibility** as new files arrive
- **Aggregation** before the client consumes results
- A decoupled **producer → stream → consumer** architecture

## Solution

A Kafka streaming app ([GitHub](https://github.com/ayotomiwasalau/Point-of-Sale-terminal-data-streaming-application)) with two components:

1. **Producer API** — watches the JSON datastore, serializes records, publishes to an **input topic**
2. **Streams API** — reads the input topic, aggregates, publishes to an **output topic** connected to the analytics client

Updates are **event-driven**: as files land in the store, they flow through Kafka to the client without a batch scheduler.

![](/images/project/streaming-pos-terminal-data-kafka-java/kafka-message-flow.png)

## Architecture breakdown

### Producer

Connects to the source datastore, serializes JSON payloads, sends to Kafka input topic.

![](/images/project/streaming-pos-terminal-data-kafka-java/kafka-producer.png)

### Stream processing

Kafka Streams (Java) consumes input topic, applies aggregations, forwards to output topic.

### Client

Subscribes to output topic for real-time dashboard or alerting use cases.

![](/images/project/streaming-pos-terminal-data-kafka-java/kafka-consumer.png)

![](/images/project/streaming-pos-terminal-data-kafka-java/kafka-service-stack.png)

## Tech stack

| Layer | Tools |
|---|---|
| Streaming | Apache Kafka (Producer + Streams APIs) |
| Language | Java |
| Build | Maven (`pom.xml`) |
| Scripts | `scripts/` for local run helpers |

## Impact

- **Real-time POS pipeline** — terminal → Kafka → analytics client
- **Separation of concerns** — ingest, process, and consume on distinct topics
- **Java/Maven baseline** for teams standardizing on JVM streaming services

## Links

- [GitHub — Point-of-Sale-terminal-data-streaming-application](https://github.com/ayotomiwasalau/Point-of-Sale-terminal-data-streaming-application)
