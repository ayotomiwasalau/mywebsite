![](/images/project/building-snowflake-data-warehouse-customer-climate-data/dwh-architecture.png)

This project builds a **Snowflake data warehouse** to explore how **weather affects restaurant reviews**. Yelp business and review data is combined with **GHCN-D** daily climate observations through a **staging → ODS → DWH** pipeline ending in a star schema for OLAP reporting.

[GitHub — datawarehousing](https://github.com/ayotomiwasalau/datawarehousing) · [Design essay (blog)](/work/blogs/snowflake-dwh-modeling)

## Context

Yelp JSON, COVID feature files, and climate CSVs arrived in incompatible shapes with no shared analytics layer. The build needed a **repeatable path** from raw files to queryable marts, **Snowflake-native loading** beyond UI upload limits, and a **dimensional model** that joins review facts to daily temperature and precipitation.

## Approach

Version-controlled SQL scripts move data through three warehouse layers—staging, ODS, and star-schema DWH—each idempotent for reruns after source updates:

1. **Staging** — ingest Yelp, COVID, precipitation, and temperature files via SnowSQL stages and `COPY` (`load_data_to_staging.sql`)
2. **ODS** — flatten JSON, parse dates, and integrate entities across sources (`staging_to_ods.sql`)
3. **DWH** — publish star-schema dimensions and a central review fact table (`ods_to_dwh.sql`)
4. **Reporting** — validate joins with weather-aware queries (`report.sql`)

![](/images/project/building-snowflake-data-warehouse-customer-climate-data/dwh-staging.png)

## Architecture breakdown

Heterogeneous Yelp and climate sources land in staging, flatten into an integrated ODS, and publish as a star schema for weather-aware review analysis. Sources, layer roles, and example joins are detailed below.

### Data sources

| Source | Contents |
|---|---|
| [Yelp Academic Dataset](https://www.yelp.com/dataset/download) | Business, user, review, tip, check-in JSON |
| [Yelp COVID features](https://www.kaggle.com/datasets/claudiadodge/yelp-academic-data-set-covid-features) | Pandemic-period business attributes |
| GHCN-D (Las Vegas, USW00023169) | Daily precipitation and temperature |

### Warehouse layers

| Layer | Role | Script |
|---|---|---|
| Staging | Raw, source-shaped landing | `load_data_to_staging.sql` |
| ODS | Integrated operational snapshot | `staging_to_ods.sql` |
| DWH | Star schema for BI / OLAP | `ods_to_dwh.sql` |

![](/images/project/building-snowflake-data-warehouse-customer-climate-data/dwh-star-schema.jpg)

The revised end-to-end diagram captures staging ingestion, ODS entity relationships, and DWH facts linked to weather dimensions:

Example reporting joins business name, temperature, precipitation, and star ratings on review date:

![](/images/project/building-snowflake-data-warehouse-customer-climate-data/dwh-query.png)

The star schema centers review facts with optional links to tips, check-ins, and COVID dimensions, so analysts can slice ratings by weather without re-deriving joins in every dashboard.

## Tech stack

Snowflake hosts all layers; SnowSQL stages and `COPY` replace manual UI uploads for large Yelp extracts.

| Layer | Tools |
|---|---|
| Warehouse | Snowflake |
| Loading | SnowSQL, internal stages, CSV file formats |
| Modeling | Layered SQL (staging, ODS, star schema) |
| Sources | Yelp dataset, Kaggle COVID features, GHCN-D |

## Load workflow

SnowSQL loads large Yelp extracts through internal stages — file formats define CSV delimiters and null handling; `PUT` uploads and `COPY` populates staging tables. JSON variant columns preserve nested Yelp payloads until ODS flattening. Each layer script is idempotent so the pipeline can rerun after source updates without manual UI steps.

## Impact

The warehouse demonstrates a repeatable pattern for joining business review facts to external climate observations—useful beyond this Las Vegas slice.

- **End-to-end DWH pattern** from heterogeneous JSON/CSV to analyst-ready marts
- **Version-controlled SQL** reproducible outside the Snowflake UI
- **Documented architecture** (`dwhdiagrevised.jpg`, draw.io) for onboarding
- **Research-ready joins** linking review stars to daily Las Vegas climate observations

## Links

Layer SQL scripts and architecture diagrams are in the repository; the blog explains dimensional modeling choices in depth.

- [GitHub — datawarehousing](https://github.com/ayotomiwasalau/datawarehousing)
- [Blog — Snowflake DWH modeling](/work/blogs/snowflake-dwh-modeling)
