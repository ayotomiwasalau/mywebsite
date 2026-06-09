![](/images/blog/club-football-micro-event-data-lake/data-club.png)

## System overview

**Club Football Data Store** is a collection of match, player, club, referee, and **atomic-level event** data from top European leagues (English, French, Spanish, German, Italian) for the **2017/18** season. It goes beyond headline stats—total shots, cards, possession—and captures granular events: pass length, shot position, tackle success, and the personnel involved.

The goal is insight at **event grain**: analysis on a given match day, round, venue, starting elevens, and referee—not only season totals. That supports analytics dashboards and predictive modelling (for example expected goals by team or player). The curated dataset is published on [Kaggle — Club Football Event Data](https://www.kaggle.com/datasets/ayotomiwasalau/club-football-event-data).

[GitHub — club_football_data_lake](https://github.com/ayotomiwasalau/club_football_data_lake) · [Project case study](/work/projects/building-micro-event-data-lake-spark-airflow-redshift)

This essay covers **why** micro-event grain matters, how **Amazon S3**, **Apache Spark**, **Apache Airflow**, and **Amazon Redshift** divide work, the **star schema** centred on `match_event`, and how the design scales. Step-by-step ETL detail lives in the [project case study](/work/projects/building-micro-event-data-lake-spark-airflow-redshift).

## Event grain vs aggregates

Most public football analytics stops at **match-level aggregates**. That grain answers league tables but breaks when you need minute-level context, pitch coordinates, or per-action features for ML.

| Question | Aggregate data | Event-grain data |
|---|---|---|
| Where did high-xG shots cluster? | Total shots only | Coordinates + outcome per shot |
| Did intensity change after a substitution? | Team totals | Timestamped events with player IDs |
| Train per-action models | Feature-poor | Action, modifier, success flags |

The design bet is **store events once, aggregate on read**. The cost is volume—event tables exceed **one million rows** for a season slice—which pushes processing into distributed Spark rather than a single Python script.

## Reference architecture: four cooperating layers

End-to-end flow matches the README pipeline:

1. **Amazon S3** — store raw football data (JSON and CSV); decouple storage from compute.
2. **Apache Spark** — extract and transform nested JSON into star-schema tables; write processed CSV back to S3.
3. **Apache Airflow** — orchestrate Redshift loads: create tables, copy from S3, run data-quality checks.
4. **Amazon Redshift** — columnar warehouse for analytics and ML on event-grain SQL.

### Data sources

| Source | Link |
|---|---|
| [Figshare Soccer match data](https://figshare.com/collections/Soccer_match_event_dataset/4415000/2) | Match and event extracts |
| [Kaggle Football Events](https://www.kaggle.com/datasets/secareanualin/football-events) | Complementary events |
| [Rapid Soccer API](https://rapidapi.com/api-sports/api/api-football) | API-backed league data |

Team, player, referee, match, competition, and event datasets were collated and parsed into a single canonical model before warehouse load.

## Why Spark for processing

Raw JSON is **hierarchical**; event data alone is **1M+ rows**. A **Spark engine on a 3-node CPU cluster** parsed sources, built fact and dimension tables per the model, and wrote CSV outputs to S3. Spark parallelizes explode/join on nested events, deduplicates entities across files, and reprocesses seasons without notebook-only workflows. At current volume, batch Spark beats row-by-row single-machine ETL; at much larger scale, Spark steps can run inside Airflow on EMR or Kubernetes.

## Star schema: fact at event grain

The logical model is a **star schema** chosen for atomic in-game actions—throw-ins, passes, shots, duels—with predictable join paths for SQL and BI.

![](/images/blog/club-football-micro-event-data-lake/star-schema.png)

### Fact: `match_event`

| Column | Type | Description |
|---|---|---|
| `id` | int | Unique event ID |
| `club_id`, `match_id`, `player_id`, `referee_id` | int | Foreign keys to dimensions |
| `matchPeriod` | string | Period of play |
| `eventName` | varchar | Event label (pass, foul, duel) |
| `action` | varchar | Specific action (simple pass, yellow card, ground attack) |
| `modifier` | varchar | Aftermath (missed ball, opportunity, high) |
| `eventSec` | float | Time of event |
| `x_start`, `y_start`, `x_end`, `y_end` | int | Pitch coordinates |
| `is_success` | boolean | Whether the event succeeded |

### Dimensions

**`match`** — `dateutc`, `competition`, `season`, `venue`, `home_club`, `away_club`, `winner`, goals, `referee_id`.

**`club`** — `name`, `OfficeName`, `country`.

**`player`** — names, `birth_date`, `country`, `position`, `foot`, `height`.

**`referee`** — names, `birthDate`, `country`.

Facts stay heavy; dimensions stay small and reusable. Analysts filter through dimension keys; ML pipelines join once for feature exports.

## Airflow's role: orchestration, not transformation

After Spark writes processed CSV to S3, **Airflow** copies data into **Redshift**: create tables, load from S3, validate quality. Airflow was chosen for straightforward hooks to S3 and Redshift and visible DAG failures when loads go wrong.

![](/images/blog/club-football-micro-event-data-lake/airflow-dag.png)

Task logs record which S3 prefix loaded when—useful lineage without re-running Spark.

## Redshift as the analytics tier

**Redshift** suits columnar scans over millions of event rows. Partitioning and distribution keys aligned to match/date filters keep analyst queries responsive. The pipeline targets **batch history** first; live match streaming would be a separate Kafka/Flink path.

## Pipeline steps

1. Store raw football data in **Amazon S3**
2. Run a **Spark** notebook/job to extract, transform, and save star-schema CSV to S3
3. Run an **Airflow** DAG to create Redshift tables, **COPY** from S3, and check data quality

## Trade-offs

| Pros | Cons |
|---|---|
| Event-grain data enables xG-style modelling and sequence analysis | Batch pipeline, not live match streaming |
| Proven AWS stack with clear layer boundaries | Redshift cost vs serverless for sporadic queries |
| Star schema simplifies SQL and BI consumption | Multi-source schema drift requires Spark maintenance |
| Public [Kaggle release](https://www.kaggle.com/datasets/ayotomiwasalau/club-football-event-data) for reproducibility | Initial JSON parsing is source-specific |

## Scaling considerations

From the project README improvement notes:

- **Refresh cadence** — update per match or weekly as new events arrive; avoid rare bulk-only loads that become cumbersome.
- **100× data volume** — extend the Airflow DAG with **Spark tasks** so extract, process, and load automate in one scheduled flow.
- **Daily 7am runs** — use pipeline scheduling for retrieval at a fixed time; scale cluster nodes for more frequent execution.
- **100+ concurrent analysts** — **partition** Redshift tables so queries stay fast under heavy read load.

Streaming (Kafka + Flink) targets live feeds; this design optimizes **reproducible batch history** and a public research dataset first.

## Link

Pipeline screenshots, full data dictionary, and publication details: [View project case study](/work/projects/building-micro-event-data-lake-spark-airflow-redshift).
