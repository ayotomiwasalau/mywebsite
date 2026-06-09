![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-installation.png)

## System overview

Before you embed Kafka in Python or Java services, prove the pipeline with **CLI tools**: create a topic, start a console consumer, publish lines from a console producer, and confirm records flow in real time. This design-first walkthrough deploys the **Confluent Platform all-in-one** stack with Docker Compose, then exercises `kafka-topics`, `kafka-console-producer`, and `kafka-console-consumer` against a shared broker.

The same topic name used here (`test-topic` for the minimal path, or `src.financials.purchases` when aligning with the [Python SDK article](/work/blogs/kafka-python-client-patterns)) becomes the contract application code will use later.

## Platform components

Confluent Kafka is not only a broker. A typical local stack includes:

- **Kafka Broker** — stores partitioned logs and serves produce/fetch requests
- **Schema Registry** — versioned Avro/JSON/Protobuf schemas for compatible evolution
- **Kafka Connect** — connectors to databases, object stores, and SaaS systems
- **ksqlDB** — stream processing with SQL over topics
- **Control Center** — UI for topics, connectors, and consumer lag
- **Prometheus / Alertmanager** — metrics and alerting (in full compose profiles)
- **Zookeeper or KRaft** — cluster metadata; modern Kafka can run **KRaft** without Zookeeper

Understanding these roles helps you know which UI to open when debugging: broker CLI for topics, Control Center for lag, Schema Registry when deserialization fails.

## Prerequisites

Install [Docker Desktop](https://docs.docker.com/desktop/) for your OS. Allocate enough memory (8 GB+ recommended) because the all-in-one profile runs multiple JVM services.

## Deploy the stack

### Step 1 — Clone Confluent quickstart

```bash
git clone https://github.com/confluentinc/cp-all-in-one.git
cd cp-all-in-one/cp-all-in-one
```

### Step 2 — Start services

```bash
docker compose up -d
```

Containers include broker, Schema Registry, Connect, ksqlDB, and Control Center. Wait until health checks pass before creating topics.

![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-service-stack.png)

![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-docker-stack.png)

Open Control Center (default URL documented in Confluent quickstart, commonly `http://localhost:9021`) to confirm brokers are online.

![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-confluent-ui.png)

![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-broker.png)

## Core concepts

- **Topic** — named channel for records (like a table stream)
- **Partition** — ordered sub-log; parallelism unit for producers and consumer groups
- **Replication factor** — copies of each partition across brokers for fault tolerance

Development often uses `partitions=1` and `replication-factor=1`. Production targets higher partition counts (throughput) and RF≥3 (availability).

## Prove the pipeline

### Step 3 — Create a topic

Run inside the broker container so bootstrap resolves to the internal listener:

```bash
docker compose exec -it broker bash -lc \
  'kafka-topics --bootstrap-server broker:9092 \
  --create --topic test-topic \
  --partitions 1 --replication-factor 1'
```

![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-topics.png)

### Step 4 — List topics

```bash
docker compose exec -it broker bash -lc \
  'kafka-topics --bootstrap-server broker:9092 --list'
```

Expect `test-topic` (and internal `__consumer_offsets` topics).

### Step 5 — Start the consumer (terminal A)

Read from the beginning so you see history plus new messages:

```bash
docker compose exec -it broker bash -lc \
  'kafka-console-consumer \
  --bootstrap-server broker:9092 \
  --topic test-topic \
  --from-beginning'
```

Leave this process running.

### Step 6 — Start the producer (terminal B)

```bash
docker compose exec -it broker bash -lc \
  'kafka-console-producer --bootstrap-server broker:9092 --topic test-topic'
```

Type JSON or key-value lines and press Enter after each record, for example:

```json
{"new1": "data1"}
{"username": "jane_doe", "currency": "USD", "amount": 4200}
```

Each line becomes one Kafka record. Terminal A should print them immediately — that is your end-to-end proof.

![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-message-passing.png)

Inspect broker-level detail in Control Center: throughput, partitions, and message browser.

![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-broker-detail.png)

![](/images/blog/confluent-kafka-cli-publish-subscribe/kafka-ui-0.png)

## Design decisions

**Docker Compose for reproducibility** — every developer gets identical broker versions and ports; avoids hand-installed Kafka mismatches.

**Internal bootstrap `broker:9092`** — producers/consumers inside the compose network use service DNS; host-side clients use advertised listeners from Confluent docs (often `localhost:9092` or `localhost:29092` depending on profile).

**Console tools before SDKs** — validates networking and ACLs before you debug application code.

**Single-partition test topic** — simplest ordering story; swap to multi-partition topics before load tests. Message order is guaranteed only within a partition, not across the whole topic.

## Trade-offs

| Pros | Cons |
|---|---|
| Fast feedback loop | Not representative of production RF/partition sizing |
| No application code required | Console producer lacks batching and retry policies |
| Full Confluent ecosystem in one command | Heavy local resource footprint |

## Troubleshooting checklist

| Symptom | Likely cause | Fix |
|---|---|---|
| Consumer shows nothing | Producer on different topic or broker URL | Match topic name and bootstrap host |
| `LEADER_NOT_AVAILABLE` | Broker still starting | Wait for compose health, retry create |
| Host cannot connect | Wrong advertised listener | Use Confluent docs port for host clients |
| Duplicate messages after restart | `--from-beginning` on same group | New consumer group or reset offsets intentionally |

Records in Kafka are **immutable** and ordered per partition. Re-running the consumer with `--from-beginning` replays history — useful for debugging, confusing if you expected only new events.

## Host-side alternative

If your broker advertises `localhost:9092` from the host, the same commands work without `docker compose exec`:

```bash
kafka-topics --create --bootstrap-server localhost:9092 \
  --topic src.financials.purchases --partitions 10 --replication-factor 1

kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic src.financials.purchases --from-beginning

kafka-console-producer --bootstrap-server localhost:9092 \
  --topic src.financials.purchases
```

## Security and production notes

Local compose uses plaintext listeners for speed. Production clusters enable **TLS**, **SASL** authentication, and **ACLs** per topic. Replication factor and minimum in-sync replicas should rise with availability goals; never ship RF=1 outside sandboxes. Schema Registry becomes important when multiple teams publish to the same topic — incompatible schema changes break consumers silently until governance catches them.

## What's next

Once CLI pub/sub works, move to application clients:

- [Kafka Python SDK — async producer and consumer](/work/blogs/kafka-python-client-patterns)
- [Streaming as a service — industry patterns](/work/blogs/streaming-as-a-service)
- [POS terminal streaming — Java Kafka Streams](/work/projects/streaming-pos-terminal-data-kafka-java)

## Extending the CLI exercise

After `test-topic` works, recreate the flow on `src.financials.purchases` with ten partitions to mirror the Python tutorial. Publish multi-line JSON purchases and confirm Control Center shows even partition spread when keys vary. That exercise validates you understand topic administration before SDK error messages mix in serialization and auth concerns.

## References

- [Confluent Platform quickstart](https://docs.confluent.io/platform/current/get-started/platform-quickstart.html)
- [GitHub — confluent-kafka-projects](https://github.com/ayotomiwasalau/confluent-kafka-projects)
