![](/images/blog/snowflake-dwh-modeling/architecture.jpg)

## System Overview

This project builds a **Snowflake data warehouse** to explore how **weather affects restaurant reviews**. Yelp business and review data is combined with GHCN-D climate observations (precipitation and temperature for Las Vegas) through a classic **staging → ODS → DWH** pipeline. Raw JSON and CSV land in Snowflake staging; SQL scripts promote data through an operational data store into a star schema for OLAP reporting.

## Component Breakdown

- **Snowflake** — cloud warehouse for staging schemas, ODS, and dimensional marts
- **SnowSQL** — CLI for large file loads via internal stages (`PUT`, `COPY`)
- **Staging layer** — raw Yelp, COVID feature, and climate files (`load_data_to_staging.sql`)
- **ODS layer** — integrated entity relationships across sources (`staging_to_ods.sql`)
- **DWH layer** — star schema for analytics (`ods_to_dwh.sql`)
- **Reporting** — example joins in `report.sql` linking reviews to weather dimensions

## Design Decisions

**Layered warehouse pattern** — separates raw ingestion from integrated ODS and analyst-facing marts, making each stage auditable and replayable.

**Snowflake-native loading** — SnowSQL and file formats handle files beyond the 25MB UI limit; no extra ETL tool required for this scale.

**Star schema for OLAP** — fact tables for reviews/events with weather and business dimensions keep analyst SQL predictable.

**Las Vegas climate station (USW00023169)** — fixed geography aligns Yelp restaurant locations with consistent GHCN-D observations for the research question.

## Trade-offs

| Pros | Cons |
|---|---|
| Fully documented SQL scripts per layer | Batch loads, not streaming |
| Snowflake handles compute/storage separation | Warehouse cost if left running |
| Heterogeneous sources unified in ODS | Source schema changes require script updates |
| Reproducible beyond the Snowflake UI | Climate–review join is correlational, not causal |

## Scaling Considerations

Add **incremental loads** with merge keys, **Fivetran/Airflow** for scheduled ingestion, **clustering keys** on large fact tables, and **role-based access** for multi-team analysts. For national coverage, partition climate data by region and expand ODS with slowly changing dimensions for business attributes.

## Link

[View Project Case Study](/work/projects/building-snowflake-data-warehouse-yelp-climate)
