![](/images/project/streaming-pos-terminal-data-kafka-java/kafka-pos-app.png)

This project streams **POS terminal transaction data** to analytics and downstream services in **near real time** using **Apache Kafka**, **Java**, and **Maven**. It follows the event-driven POS pattern in [Streaming as a service](/work/blogs/streaming-as-a-service).

[GitHub — Point-of-Sale-terminal-data-streaming-application](https://github.com/ayotomiwasalau/Point-of-Sale-terminal-data-streaming-application) · [Design essay (blog)](/work/blogs/streaming-as-a-service)

## Context

Retail and hospitality POS terminals emit high-volume transaction JSON. Finance and operations need **live visibility**—not end-of-day batch files—with **routing and enrichment** before dashboards, loyalty systems, shipment workflows, and analytics sinks can consume the stream. The pipeline had to ingest from many terminals, branch on business rules in flight, and land purpose-built topics for each downstream team.

## Approach

The [repo](https://github.com/ayotomiwasalau/Point-of-Sale-terminal-data-streaming-application) separates **produce** from **transform** across two JVM apps—simulated terminals publish to a single input topic; Kafka Streams fans out enriched records to downstream consumers:

| Module | Role |
|---|---|
| **`producer_api`** | Simulates several terminals publishing `PosInvoice` JSON to the input topic |
| **Root `src/main`** (`PosPushOutApp`) | **Kafka Streams** fan-out: filter, transform, and write to downstream topics |

**Flow:** terminals → **`pos`** topic → **`PosFanout`** stream → **`shipment`**, **`loyalty`**, or **`hadoop-sink`** topics → dedicated consumers (analytics / ops clients).

## Architecture breakdown

The topology runs producer simulation, stream branching, and topic-specific consumers. The sections below walk through each module and the local scripts that stand up brokers and topics.

### Producer — `PosSimulator`

`producer_api` runs **`PosSimulator`**, which starts a thread pool of **`RunnableProducer`** workers. Each worker:

- Generates the next invoice via **`InvoiceGenerator`** (synthetic POS JSON: store, line items, payment, delivery, customer type)
- Publishes to Kafka with **`JsonSerializer`**, message key = **`storeID`**
- Sleeps for a configurable interval between events

CLI: `topicName`, `noOfProducers`, `produceSpeed` (ms between messages)—so you can mimic many terminals on one topic.

```bash
# Example: 5 producers, 500ms interval, writing to pos
java -jar ... PosSimulator pos 5 500
```

### Stream processing — `PosPushOutApp`

**`PosPushOutApp`** (`applicationID`: `PosFanout`) reads **`pos`** and branches in one topology:

| Branch | Condition | Output topic | Output |
|---|---|---|---|
| Shipment | `DeliveryType` = `HOME-DELIVERY` | `shipment` | Full `PosInvoice` for fulfilment |
| Loyalty | `CustomerType` = `PRIME` | `loyalty` | `Notification` with earned points (`totalAmount × 0.02`) |
| Analytics sink | All invoices | `hadoop-sink` | PII-masked invoice → **`HadoopRecord`** per line item (denormalized rows) |

**`RecordBuilder`** implements the transforms: mask card number and delivery contact fields, build loyalty notifications, and explode line items into flat analytics records (item code, qty, price, optional city/state for home delivery).

### Topics and local ops

`AppConfigs` targets `localhost:9092` and `localhost:9093`. The **`scripts/`** folder creates topics (e.g. **`pos`** with 3 partitions) and starts ZooKeeper, brokers, and sample consumers (`start-shipment-consumer`, `start-loyalty-consumer`, `start-hadoop-sink-consumer`).

Typical local order:

1. Start ZooKeeper and Kafka brokers  
2. Create `pos`, `shipment`, `loyalty`, `hadoop-sink` topics  
3. Run **`PosPushOutApp`** (Streams)  
4. Run **`PosSimulator`** against `pos`  
5. Start consumers on downstream topics to verify fan-out  

## Data model

**`PosInvoice`** (JSON) includes invoice metadata, `CustomerType`, `DeliveryType`, `DeliveryAddress`, and `InvoiceLineItems`. Downstream types: **`Notification`** (loyalty), **`HadoopRecord`** (flattened line-level facts for warehousing-style analytics).

Serde is custom **`JsonSerializer`** / **`JsonDeserializer`** via **`AppSerdes`**.

## Tech stack

Java 8, Maven, and Kafka 2.3 APIs keep the project aligned with enterprise JVM streaming stacks—the same serde and Streams patterns teams use after prototyping in Python or the CLI.

| Layer | Tools |
|---|---|
| Streaming | Apache Kafka Producer API, Kafka Streams 2.3 |
| Language | Java 8 |
| Build | Maven (`pom.xml`, `producer_api/pom.xml`) |
| Types | Jackson JSON, jsonschema2pojo (schema under `src/main/resources/schema/`) |
| Local ops | Windows `.cmd` scripts in `scripts/` and `producer_api/scripts/` |

## Design decisions

Three choices shaped the fan-out topology: one ingest contract, Streams-native branching, and PII handling before analytics sinks.

**Fan-out from one `pos` topic** — one ingest contract; shipment, loyalty, and analytics teams subscribe to purpose-built topics without touching raw POS payloads.

**Streams for branching** — filters and maps stay in **`PosPushOutApp`** instead of multiple ad hoc consumers re-parsing the same stream.

**PII masking before analytics** — `getMaskedInvoice` strips card and address contact fields before **`HadoopRecord`** expansion.

**Simulated producers** — `InvoiceGenerator` stands in for a folder of JSON files while keeping the same serialized shape described in the [README](https://github.com/ayotomiwasalau/Point-of-Sale-terminal-data-streaming-application/blob/master/README.md).

## Impact

The project demonstrates a complete POS-style streaming path—from multi-terminal ingest through enriched downstream topics—without hiding logic behind a managed connector.

- **Real-time POS-style pipeline** — multi-terminal ingest → Kafka → enriched downstream topics  
- **Separation of concerns** — produce, transform, and consume on distinct topics  
- **JVM pattern** for teams using Kafka Streams after CLI or Python prototyping  
- **Replayable log** — retained Kafka topics support reprocessing after logic changes  

## Links

Source, local run scripts, and schema definitions live in the repository; the blogs cover streaming patterns and Kafka client ergonomics.

- [GitHub — Point-of-Sale-terminal-data-streaming-application](https://github.com/ayotomiwasalau/Point-of-Sale-terminal-data-streaming-application)
- [Blog — Streaming as a service](/work/blogs/streaming-as-a-service)
- [Blog — Kafka CLI pub/sub](/work/blogs/confluent-kafka-cli-publish-subscribe)
- [Blog — Kafka Python client patterns](/work/blogs/kafka-python-client-patterns)
