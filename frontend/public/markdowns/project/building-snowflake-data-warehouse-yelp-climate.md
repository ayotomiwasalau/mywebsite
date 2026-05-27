![](/images/project/building-snowflake-data-warehouse-yelp-climate/dwhdiagrevised.jpg)

A research question drove this build: **how does weather affect restaurant reviews?** The project models **Yelp review data alongside GHCN-D climate observations** in a layered Snowflake warehouse for OLAP reporting.

## Problem

Raw Yelp JSON, COVID feature files, and climate CSVs live in different formats and schemas. Analytics needed:

- A **repeatable ETL path** from raw files → staging → ODS → warehouse
- **Dimensional modeling** for review and weather facts
- **Snowflake-native** loading (SnowSQL, file formats, stages) at scale beyond UI upload limits

## Solution

Full **staging → ODS → DWH** pipeline in Snowflake ([GitHub — datawarehousing](https://github.com/ayotomiwasalau/datawarehousing)):

1. **Staging** — ingest Yelp, COVID, precipitation, and temperature files via SnowSQL `PUT` and `COPY`
2. **ODS** — normalize entities and relationships across sources (`staging_to_ods.sql`)
3. **DWH** — star schema for analytics (`ods_to_dwh.sql`) with reporting queries (`report.sql`)

![](/images/project/building-snowflake-data-warehouse-yelp-climate/dwh-architecture.png)

## Architecture breakdown

### Data sources

- **Yelp Academic Dataset** — business and review JSON
- **Yelp COVID features** — pandemic-period business attributes
- **GHCN-D climate** — Las Vegas precipitation and temperature (station USW00023169)

### Warehouse layers

| Layer | Role |
|---|---|
| Staging | Raw, source-shaped data (`load_data_to_staging.sql`) |
| ODS | Integrated operational snapshot (`staging_to_ods.sql`) |
| DWH | Star schema for BI and OLAP (`ods_to_dwh.sql`) |

![](/images/project/building-snowflake-data-warehouse-yelp-climate/dwh-staging.png)

![](/images/project/building-snowflake-data-warehouse-yelp-climate/dwh-star-schema.jpg)

![](/images/project/building-snowflake-data-warehouse-yelp-climate/dwhdiagrevised.jpg)

### Reporting

Example analytics in `report.sql` join review facts with weather dimensions to explore review patterns under different climate conditions.

![](/images/project/building-snowflake-data-warehouse-yelp-climate/dwh-query.png)

## Tech stack

| Layer | Tools |
|---|---|
| Warehouse | Snowflake |
| Loading | SnowSQL, internal stages, CSV file formats |
| Modeling | SQL (staging, ODS, star schema) |
| Sources | Yelp dataset, Kaggle COVID features, GHCN-D |

## Impact

- **End-to-end DWH pattern** from heterogeneous JSON/CSV to queryable marts
- **Documented SQL scripts** for each layer — reproducible beyond the Snowflake UI
- **Architecture diagrams** (`dwhdiagrevised.jpg`, draw.io) for onboarding analysts

## Links

- [GitHub — datawarehousing](https://github.com/ayotomiwasalau/datawarehousing)
- [Blog — Snowflake DWH modeling](/posts/snowflake-dwh-modeling)
