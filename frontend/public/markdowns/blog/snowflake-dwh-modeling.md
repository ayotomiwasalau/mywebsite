![](/images/blog/snowflake-dwh-modeling/architecture.jpg)

The goal of this project is to build a **data warehouse** from real **Yelp customer review** data and **climate** observations—to analyze how weather affects restaurant reviews. Temperature and precipitation come from the [Global Historical Climatology Network-Daily (GHCN-D)](https://www.ncei.noaa.gov/products/land-based-station/global-historical-climatology-network-daily) database.

**Snowflake** is the cloud-native warehouse used to architect and load the DWH for reporting and **OLAP**.

[GitHub — datawarehousing](https://github.com/ayotomiwasalau/datawarehousing) · [Project case study](/work/projects/building-snowflake-data-warehouse-customer-climate-data)

**Tools:** [Snowflake](https://www.snowflake.com/en/) · [SnowSQL](https://sfc-repo.snowflakecomputing.com/snowsql/bootstrap/index.html)

## Data sources

### Yelp reviews

Review and business data from the [Yelp Academic Dataset](https://www.yelp.com/dataset/download). The download is compressed—extract with:

```bash
tar -xvzf yelp_dataset.tar
```

![](/images/blog/snowflake-dwh-modeling/dwh_yelpdata.png)

### COVID data

Yelp business attributes during COVID from [Kaggle — Yelp academic COVID features](https://www.kaggle.com/datasets/claudiadodge/yelp-academic-data-set-covid-features). After download you get `yelp_academic_dataset_covid_features.json`:

```bash
unzip archive.zip
```

### Climate data

Historical precipitation and temperature for **Las Vegas, Nevada** (weather station **USW00023169**), from [Climate Explorer](https://crt-climate-explorer.nemac.org/):

- Precipitation — `USW00023169-LAS VEGAS MCCARRAN`
- Temperature — `USW00023169-TEMPERATURE-DEGREEF`

## Data warehousing layers

A typical warehouse has three layers:

**Staging** — Raw data lands here, often still in source format (CSV, JSON, logs, external DB exports). Data is prepared before moving downstream.

**Operational Data Store (ODS)** — A current snapshot that combines sources into one **entity-relationship model**. Transformations run here before the warehouse layer; teams can query ODS because schemas stay close to source systems.

**Warehouse (DWH)** — Supports **BI and OLAP** on enterprise-wide historical data. One version of truth for reporting; efficient for analytics at scale.

## Building the data warehouse

### Create data architecture

Start with an architecture diagram for how data flows into **Staging**, **ODS**, and **DWH**:

![](/images/blog/snowflake-dwh-modeling/dwh_architecture.png)

### Ingest into staging

Create a **staging schema** in Snowflake and load raw files from each source.

Small files (under ~25 MB) can use the Snowflake UI. For larger files, use **SnowSQL** with a file format, internal stage, and `PUT`:

```sql
CREATE OR REPLACE FILE FORMAT mycsvformat
  TYPE = 'CSV'
  COMPRESSION = 'auto'
  FIELD_DELIMITER = ','
  RECORD_DELIMITER = '\n'
  SKIP_HEADER = 1
  ERROR_ON_COLUMN_COUNT_MISMATCH = TRUE
  NULL_IF = ('NULL', 'null')
  EMPTY_FIELD_AS_NULL = TRUE;
```

```bash
CREATE OR REPLACE STAGE my_large_data_stage FILE_FORMAT = mycsvformat;

PUT file:///Users/mylocal/Downloads/large.csv @my_large_data_stage
  AUTO_COMPRESS = TRUE
  PARALLEL = 4;
```

Third-party tools such as Fivetran, Kafka, or Apache NiFi can also feed staging.

Loaded staging data:

![](/images/blog/snowflake-dwh-modeling/dwh_yelp_staging_db.png)

![](/images/blog/snowflake-dwh-modeling/dwh_yelp_staging_tw.png)

### Migrate staging → ODS

Design an **ERD** for the ODS layer—a single integrated model across Yelp JSON, COVID features, and climate CSVs. ODS cleans, renames, and types fields while staying queryable for operational use.

![](/images/blog/snowflake-dwh-modeling/dwh_ods.jpg)

Example: flatten Yelp business JSON from a variant column into a relational table:

```sql
DROP TABLE IF EXISTS YELP_PROJECT_DB.ODS.BUSINESS;

CREATE TABLE YELP_PROJECT_DB.ODS.BUSINESS (
    BUSINESS_ID         STRING  PRIMARY KEY,
    ADDRESS             STRING,
    CATEGORIES          STRING,
    CITY                STRING,
    HOURS               STRING,
    IS_OPEN             INTEGER,
    LATITUDE            FLOAT,
    LONGITUDE           FLOAT,
    NAME                STRING,
    POSTAL_CODE         STRING,
    REVIEW_COUNT        INTEGER,
    STARS               FLOAT,
    STATE               STRING,
    BYAPPOINTMENTONLY   STRING
);

INSERT INTO YELP_PROJECT_DB.ODS.BUSINESS (
    BUSINESS_ID, ADDRESS, CATEGORIES, CITY, HOURS, IS_OPEN,
    LATITUDE, LONGITUDE, NAME, POSTAL_CODE, REVIEW_COUNT, STARS, STATE, BYAPPOINTMENTONLY
)
SELECT
    data:business_id::STRING,
    data:address::STRING,
    data:categories::STRING,
    data:city::STRING,
    data:hours::STRING,
    data:is_open::INTEGER,
    data:latitude::FLOAT,
    data:longitude::FLOAT,
    data:name::STRING,
    data:postal_code::STRING,
    data:review_count::INTEGER,
    data:stars::FLOAT,
    data:state::STRING,
    data:attributes.ByAppointmentOnly::STRING
FROM YELP_PROJECT_DB.STAGING.YELP_BUSINESS_DATA;
```

Users follow the same pattern from `YELP_USER_DATA` staging. Climate loads join a shared **date** dimension—for example precipitation:

```sql
DROP TABLE IF EXISTS YELP_PROJECT_DB.ODS.PRECIPITATION;

CREATE TABLE YELP_PROJECT_DB.ODS.PRECIPITATION (
    DATE DATE PRIMARY KEY,
    PRECIPITATION STRING,
    PRECIPITATION_NORMAL FLOAT,
    CONSTRAINT fk_temp_date FOREIGN KEY (DATE)
        REFERENCES YELP_PROJECT_DB.ODS.DATE(DATE)
);

INSERT INTO YELP_PROJECT_DB.ODS.PRECIPITATION
SELECT
    TO_DATE(CAST(date AS VARCHAR), 'YYYYMMDD') AS date,
    precipitation,
    precipitation_normal
FROM YELP_PROJECT_DB.STAGING.PRECIPITATION;
```

ODS tables in Snowflake:

![](/images/blog/snowflake-dwh-modeling/dwh_ods_snflk.png)

![](/images/blog/snowflake-dwh-modeling/dwh_ods_samp.png)

### Load ODS → warehouse (star schema)

The DWH layer uses a **star schema**—efficient for fact-and-dimension OLAP queries. Reviews sit at the center; weather joins on **review date**.

![](/images/blog/snowflake-dwh-modeling/dwh_star_schema.jpg)

Dimension examples (customer and business from ODS):

```sql
DROP TABLE IF EXISTS YELP_PROJECT_DB.DWH.DIM_CUSTOMER;
CREATE TABLE YELP_PROJECT_DB.DWH.DIM_CUSTOMER AS
SELECT DISTINCT * FROM YELP_PROJECT_DB.ODS.USERS;

DROP TABLE IF EXISTS YELP_PROJECT_DB.DWH.DIM_BUSINESS;
CREATE TABLE YELP_PROJECT_DB.DWH.DIM_BUSINESS AS
SELECT DISTINCT * FROM YELP_PROJECT_DB.ODS.BUSINESS;

DROP TABLE IF EXISTS YELP_PROJECT_DB.DWH.DIM_REVIEW;
CREATE TABLE YELP_PROJECT_DB.DWH.DIM_REVIEW (
    REVIEW_ID STRING PRIMARY KEY,
    COOL INTEGER,
    DATE DATE,
    FUNNY INTEGER,
    STARS INTEGER,
    TEXT STRING,
    USEFUL INTEGER
);
INSERT INTO YELP_PROJECT_DB.DWH.DIM_REVIEW
SELECT DISTINCT REVIEW_ID, COOL, DATE, FUNNY, STARS, TEXT, USEFUL
FROM YELP_PROJECT_DB.ODS.REVIEW;
```

Central **facts** table linking business, customer, review, tips, check-in, COVID, and review date (weather key):

```sql
DROP TABLE IF EXISTS YELP_PROJECT_DB.DWH.FACTS;

CREATE TABLE YELP_PROJECT_DB.DWH.FACTS (
    ID INT PRIMARY KEY AUTOINCREMENT,
    BUSINESS_ID STRING,
    CUSTOMER_ID STRING,
    REVIEW_ID STRING,
    REVIEW_DATE DATE,
    TIPS_ID INT,
    CHECKIN_ID INT,
    COVID_ID INT,
    FOREIGN KEY (BUSINESS_ID) REFERENCES YELP_PROJECT_DB.DWH.DIM_BUSINESS(BUSINESS_ID),
    FOREIGN KEY (CUSTOMER_ID) REFERENCES YELP_PROJECT_DB.DWH.DIM_CUSTOMER(USER_ID),
    FOREIGN KEY (REVIEW_ID) REFERENCES YELP_PROJECT_DB.DWH.DIM_REVIEW(REVIEW_ID),
    FOREIGN KEY (REVIEW_DATE) REFERENCES YELP_PROJECT_DB.DWH.DIM_TEMP_PRECIP(DATE),
    FOREIGN KEY (TIPS_ID) REFERENCES YELP_PROJECT_DB.DWH.DIM_TIPS(TIP_ID),
    FOREIGN KEY (CHECKIN_ID) REFERENCES YELP_PROJECT_DB.DWH.DIM_CHECK_IN(CHECKIN_ID),
    FOREIGN KEY (COVID_ID) REFERENCES YELP_PROJECT_DB.DWH.DIM_COVID(COV_ID)
);

INSERT INTO YELP_PROJECT_DB.DWH.FACTS (
    BUSINESS_ID, CUSTOMER_ID, REVIEW_ID, REVIEW_DATE, TIPS_ID, CHECKIN_ID, COVID_ID
)
SELECT DISTINCT
    R.BUSINESS_ID,
    R.USER_ID,
    R.REVIEW_ID,
    R.DATE AS REVIEW_DATE,
    T.TIP_ID,
    C.CHECKIN_ID,
    CO.COV_ID
FROM YELP_PROJECT_DB.ODS.REVIEW R
JOIN YELP_PROJECT_DB.ODS.BUSINESS B ON R.BUSINESS_ID = B.BUSINESS_ID
JOIN YELP_PROJECT_DB.ODS.USERS U ON R.USER_ID = U.USER_ID
LEFT JOIN YELP_PROJECT_DB.ODS.TIPS T
    ON R.BUSINESS_ID = T.BUSINESS_ID AND R.USER_ID = T.USER_ID
LEFT JOIN YELP_PROJECT_DB.ODS.CHECK_IN C
    ON R.BUSINESS_ID = C.BUSINESS_ID AND R.DATE = C.DATE
LEFT JOIN YELP_PROJECT_DB.ODS.COVID CO ON R.BUSINESS_ID = CO.BUSINESS_ID;
```

DWH tables after load:

![](/images/blog/snowflake-dwh-modeling/dwh_snw_table.png)

### Test the warehouse with a query

Validate the model by relating weather to ratings—for example business name, temperature, precipitation, and stars:

```sql
SELECT DISTINCT
    B.NAME AS BUSINESS_NAME,
    TP.MIN AS MIN_TEMPERATURE,
    TP.MAX AS MAX_TEMPERATURE,
    TP.PRECIPITATION,
    TP.PRECIPITATION_NORMAL,
    R.STARS,
    F.REVIEW_DATE
FROM YELP_PROJECT_DB.DWH.FACTS F
JOIN YELP_PROJECT_DB.DWH.DIM_BUSINESS B ON F.BUSINESS_ID = B.BUSINESS_ID
JOIN YELP_PROJECT_DB.DWH.DIM_TEMP_PRECIP TP ON F.REVIEW_DATE = TP.DATE
JOIN YELP_PROJECT_DB.DWH.DIM_REVIEW R ON F.REVIEW_ID = R.REVIEW_ID;
```

![](/images/blog/snowflake-dwh-modeling/dwh_query.png)

## Conclusion

This walkthrough covers end-to-end setup in Snowflake: land heterogeneous sources in staging, integrate them in ODS, publish a star schema in DWH, and run OLAP queries that join reviews to daily climate. That layered pattern is a practical foundation for analytics and downstream AI use cases on consolidated enterprise data.

## Design notes

**JSON in staging, relations in ODS** — Yelp nested JSON stays auditable in staging; `data:field::TYPE` parsing in ODS yields analyst-friendly tables.

**Las Vegas scope** — Yelp businesses and station USW00023169 share a metro, so review dates equi-join to local daily weather without geospatial interpolation in v1.

**Star schema** — A central `FACTS` table with conformed dimensions beats wide tables for storage, slowly changing attributes, and predictable BI joins.

**Batch SQL** — Scripted SnowSQL loads keep the repo reproducible; production would add MERGE increments, clustering on `REVIEW_DATE`, Snowflake Tasks or Airflow, and row access policies on PII.

| Pros | Cons |
|---|---|
| Clear lineage from raw JSON to star schema | Batch loads, not near-real-time |
| Snowflake native JSON and bulk `PUT`/`COPY` | Warehouse credits if compute stays on |
| Date spine simplifies weather joins | Single-city climate limits generalization |
| Layered SQL portable across accounts | Source schema changes need script updates |

## Resources

- [GitHub — datawarehousing](https://github.com/ayotomiwasalau/datawarehousing)
- [Project case study](/work/projects/building-snowflake-data-warehouse-customer-climate-data)
- Full scripts in repo: `load_data_to_staging.sql`, `staging_to_ods.sql`, `ods_to_dwh.sql`, `report.sql`
