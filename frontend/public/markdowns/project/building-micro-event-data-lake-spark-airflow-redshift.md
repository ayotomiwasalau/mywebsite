![](/images/project/building-micro-event-data-lake-spark-airflow-redshift/dataschema.png)

Most public football data stops at match-level aggregates — total shots, cards, possession. Analysts and ML teams need **atomic match events**: every pass, duel, shot, and tackle with timing, location, outcome, and the players involved. This project builds an **S3 → Spark → Airflow → Redshift** pipeline across top European leagues (2017/18), published on Kaggle. Architectural rationale — event grain vs aggregates, scaling paths — is in the [design write-up](/work/blogs/club-football-micro-event-data-lake).

[GitHub — club_football_data_lake](https://github.com/ayotomiwasalau/club_football_data_lake) · [Kaggle dataset](https://www.kaggle.com/datasets/ayotomiwasalau/club-football-event-data) · [Design write-up (blog)](/work/blogs/club-football-micro-event-data-lake)

## Context

Club analytics built on coarse statistics cannot answer minute-level or player-sequence questions, and **expected-goals** models need shot coordinates and context — not box-score totals. Raw sources combine nested JSON, CSV extracts, and API payloads at **1M+ event rows**, too large for single-machine ETL and too messy for direct warehouse loads without a canonical schema.

## Approach

The pipeline lands heterogeneous sources in S3, normalizes them with Spark into a star schema, and promotes curated CSV through Airflow into Redshift—with quality gates before publication:

1. Land raw football data in **Amazon S3** from multiple sources.
2. **Extract and transform** with **Apache Spark** on a 3-node cluster — parse nested JSON, normalize clubs/players/matches, build star-schema tables.
3. Write processed CSV back to S3.
4. **Orchestrate loads** with **Apache Airflow** into **Amazon Redshift**: create tables, `COPY` from S3, run data-quality checks.
5. Publish the curated dataset on **Kaggle** for dashboards and ML.

The model is a **star schema** with **`match_event`** as the fact table and dimensions for `match`, `club`, `player`, and `referee` — suited to event-grain SQL and feature engineering. Fact rows carry period, action, modifier, duration, pitch coordinates, and success flags; dimensions hold competition, season, and entity metadata.

![](/images/project/building-micro-event-data-lake-spark-airflow-redshift/pipeline-runs.png)

Airflow DAG runs show repeatable warehouse loads with explicit failure on quality checks — no silent bad data in Redshift.

## Sources

Three upstream feeds cover structured extracts, complementary event files, and league API data—the Spark jobs reconcile them into one canonical event grain before warehouse load.

| Source | Role |
|---|---|
| [Figshare Soccer match data](https://figshare.com/articles/dataset/Soccer_match_data/8892904) | Structured match and event extracts |
| [Kaggle Football Events](https://www.kaggle.com/datasets/secareanualin/football-events) | Complementary event records |
| Rapid Soccer API | Top five European leagues, 2017/18 season |

Spark jobs align heterogeneous schemas into the canonical star model before Redshift ingestion. Full field definitions are in the [GitHub data dictionary](https://github.com/ayotomiwasalau/club_football_data_lake#data-dictionary).

## Tech stack

S3 is the handoff between distributed Spark transforms and Redshift loads; Airflow owns scheduling and data-quality checks on the warehouse path.

| Layer | Tools |
|---|---|
| Storage | Amazon S3 |
| Processing | Apache Spark (multi-node cluster) |
| Orchestration | Apache Airflow |
| Warehouse | Amazon Redshift |
| Publication | Kaggle |

## Impact

Beyond the Kaggle release, the project shows how to scale event-grain sports data from messy multi-source inputs to analyst-ready warehouse tables.

- **1M+ micro-event rows** — passes, shots, tackles, duels with coordinates and outcomes
- **Five top European leagues** (2017/18): English, French, Spanish, German, Italian
- **Star schema** enabling analytics and ML (e.g. expected goals by team or player)
- **Public Kaggle dataset** for reproducible analysis and community use
- **Repeatable Airflow DAGs** with data-quality gates before warehouse promotion

## Links

The repository holds Spark and Airflow code; Kaggle hosts the published dataset; the blog covers architecture trade-offs in depth.

- [GitHub — club_football_data_lake](https://github.com/ayotomiwasalau/club_football_data_lake)
- [Kaggle — Club Football Event Data](https://www.kaggle.com/datasets/ayotomiwasalau/club-football-event-data)
- [Blog — architecture and design trade-offs](/work/blogs/club-football-micro-event-data-lake)
