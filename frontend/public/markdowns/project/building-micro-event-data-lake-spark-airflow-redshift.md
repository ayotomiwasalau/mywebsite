![](/images/project/building-micro-event-data-lake-spark-airflow-redshift/dataschema.png)

Most public football data stops at match-level aggregates — total shots, cards, possession. That is enough for headlines, not for serious analytics. Analysts and ML teams need **atomic match events**: every pass, duel, shot, and tackle, with timing, location, outcome, and the players involved.

This project walks through **building a micro-event data lake on AWS** — Spark for distributed ETL, Airflow for orchestration, and Redshift for analytics — across top European leagues (2017/18 season), published on Kaggle and documented on GitHub.

## Problem

Club and match analytics often rely on coarse statistics. That limits what you can answer:

- What happened at a specific minute in a specific match?
- How did pass length, pitch location, and success rate combine for a player on a given day?
- Can you train models (e.g. **expected goals**) on event-level features instead of box-score totals?

The raw sources are messy: JSON hierarchies, CSV extracts, multiple APIs, and **event tables large enough to need distributed processing** (1M+ rows). The goal was to collate, model, and serve this data in a way that supports analytics dashboards and downstream ML — not another "goals and assists" table.

## Solution

Build an end-to-end **data lake → processing → warehouse** flow:

1. Land raw football data in **Amazon S3** (JSON and CSV from multiple sources).
2. **Extract and transform** with **Apache Spark** on a multi-node cluster — parsing nested JSON, normalizing entities, and shaping tables to a dimensional model.
3. Write processed tables back to S3 as CSV.
4. **Orchestrate loads** with **Apache Airflow** into **Amazon Redshift**: create tables, copy from S3, run data-quality checks.
5. Publish the curated dataset on **Kaggle** for analysis and visualization.

The logical model is a **star schema** centred on `match_event` as the fact table, with dimensions for match, club, player, and referee — suited to event-grain queries and ML feature engineering.

## Architecture breakdown

### Ingestion

Raw data was sourced from:

- [Figshare Soccer match data](https://figshare.com/articles/dataset/Soccer_match_data/8892904)
- [Kaggle Football Events](https://www.kaggle.com/datasets/secareanualin/football-events)
- Rapid Soccer API

JSON event payloads are hierarchical; CSV and API extracts needed parsing and alignment before modelling. Everything lands in S3 as the system of record for raw and processed layers.

### Processing

Event data volume made single-machine ETL impractical. **Spark on a 3-node CPU cluster** handled extraction, transformation, and writes to S3.

Processing included:

- Parsing nested JSON event structures
- Building fact and dimension tables per the star schema
- Handling high-cardinality event attributes (action, modifier, coordinates, success flags)

### Storage

- **S3** — raw and processed CSV outputs
- **Redshift** — analytical warehouse with partitioning suited to analytics and ML workloads

Airflow DAGs automate: table creation, S3 → Redshift copy, and quality checks after load.

![](/images/project/building-micro-event-data-lake-spark-airflow-redshift/pipeline-runs.png)

### Serving

The curated dataset is available on Kaggle for exploration, dashboards, and modelling (including xG-style use cases). The warehouse design supports SQL analytics over match, player, club, and event grain.

## Data model (high level)

**Fact:** `match_event` — atomic in-game events (pass, foul, duel, shot, etc.) with period, action, modifier, duration, pitch coordinates, and success flag.

**Dimensions:** `match`, `club`, `player`, `referee` — context for who, where, when, and under which competition/season.

Full field-level definitions live in the [GitHub README](https://github.com/ayotomiwasalau/club_football_data_lake#data-dictionary).

## Tech stack

| Layer | Tools |
|---|---|
| Storage | Amazon S3 |
| Processing | Apache Spark (Jupyter notebook, multi-node cluster) |
| Orchestration | Apache Airflow |
| Warehouse | Amazon Redshift |
| Sources | Figshare, Kaggle Football Events, Rapid Soccer API |
| Publication | Kaggle dataset |

## Impact

- **Event-grain data** — passes, shots, tackles, duels, and more with coordinates and outcomes, not just match totals
- **1M+ event rows** processed with Spark for scalable transformation
- **Five top European leagues** (2017/18): English, French, Spanish, German, Italian
- **Star schema** enabling analytics and ML (e.g. expected goals by team or player)
- **Public dataset** on Kaggle for reproducible analysis and community use

## Improvements (next iteration)

- **Incremental updates** — load per match or weekly as new events are generated
- **Scale-out pipeline** — embed Spark steps in the Airflow DAG for 100× volume growth
- **Scheduled ingestion** — automate retrieval (e.g. daily 7am runs) with right-sized clusters
- **Multi-tenant access** — partition Redshift for 100+ concurrent analysts without query lag

## Links

- [GitHub — club_football_data_lake](https://github.com/ayotomiwasalau/club_football_data_lake)
- [Kaggle — Club Football Event Data](https://www.kaggle.com/datasets/ayotomiwasalau/club-football-event-data)
- [Related write-up — Club football micro-event data lake](/work/blogs/club-football-micro-event-data-lake)
