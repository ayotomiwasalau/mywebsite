![](/images/blog/snowflake-dwh-modeling/dwh_snowflake.png)

The goal of this project is to build a data warehouse for actual Yelp customer review and climate data. It is to analyze the effects the weather has on customer reviews of restaurants. The data for temperature and precipitation observations are from the Global Historical Climatology Network-Daily (GHCN-D) database

A leading industry cloud-native data warehouse system called `Snowflake` was used to architect and design the Data Warehouse DWH for the purpose of reporting and online analytical processing (OLAP).


### Data sources

#### Yelp reviews
Sourced reviews data from [Yelp dataset](https://www.yelp.com/dataset/download). It comes compressed so had to use the command below to unzip

```bash
tar -xvzf yelp_dataset.tar
```

![](/images/blog/snowflake-dwh-modeling/dwh_yelpdata.png)

#### Covid data
This includes yelp data on businesses during COVID - [data](https://www.kaggle.com/datasets/claudiadodge/yelp-academic-data-set-covid-features). Once you download and extract it, you should get a folder containing one json file, ```yelp_academic_dataset_covid_features.json```.

```bash
unzip archive.zip
```

#### Climate Data
This is data on precipitation and temperature. These data files contain historical weather data for the city of Las Vegas (Nevada) (Weather Station - USW00023169), and were obtained from [Climate explorer](https://crt-climate-explorer.nemac.org/)

- Precipitation Data - USW00023169-LAS VEGAS MCCARRAN
- Temperature Data - USW00023169-TEMPERATURE-DEGREEF


### Tools
- [Snowflake](https://www.snowflake.com/en/) 
- [SnowSQL](https://sfc-repo.snowflakecomputing.com/snowsql/bootstrap/index.html)

### Data warehousing system

A data warehouse system typically consist of 3 layers
- Staging layer 
- Operational Data Store (ODS) layer
- Warehouse Layer

**Staging layer**: This is where the raw data is collected, typical the data is unformated and still maintains the source schema. It is the state where the data get prepped before taking it further downstream. The source can be from CSV, JSON, external DBs, log files, IOT device etc.

**Operation layer**: This is the central layer that provides a current/recent "snapshot" of the data from all ingested transactional systems. It is combines all the data sources into a singular entity relationship diagram. It allows organizations to combine data from the original format, even if different, from various external and internal sources into a single centralized location. The layer is primary OLTP in nature Here transformation happens before finally loaded into the warehouse layer

**Warehouse layer**: The sole purpose of this layer is to enable and support business intelligence (BI) activities, especially data analytics, OLAP. Data warehouses are efficient in performing queries and analyses on large amounts of enterprise-wide historical data. This system ensures a Single Version of Truth for your data(which can be coming from a wide variety of sources) and provides all users access to the same data. It is especially effective at providing enterprise-wide reporting on data.

### Buuilding the Data Warehouse

#### Create data architecture

First we create a data architecture diagram to visualize how we will ingest and migrate the data into Staging, Operational Data Store (ODS), and Data Warehouse environments,

![](/images/blog/snowflake-dwh-modeling/dwh_architecture.png)

#### Ingest into staging

Here we create a staging environment(schema) in Snowflake. This is the raw data ingested from the various sources. To ingest data into Snowflake, there are several ways to do it, this includes basically uploading the data through the UI if the data files are small sizes (max 25MB), however for big files, Snowflake offer the SnowSQL CLI client that allows us to load the files.

```bash
create or replace file format mycsvformat type='CSV' compression='auto'
field_delimiter=',' record_delimiter = '\n'  skip_header=1 error_on_column_count_mismatch=true null_if = ('NULL', 'null') empty_field_as_null = true;
```

```bash
create or replace stage my_large_data_stage file_format = mycsvformat;

put file:///Users/mylocal/Downloads/large.csv @my_large_data_stage auto_compress=true parallel=4;

```

Other third party tool like Fivetran, Kafka, Apache Nifi etc can be used as well for ingestion.

In the image below the data has been loaded into staging.

![](/images/blog/snowflake-dwh-modeling/dwh_yelp_staging_db.png)

![](/images/blog/snowflake-dwh-modeling/dwh_yelp_staging_tw.png)

#### Migrate the data from staging to the ODS layer

Next create the ODS environment(aka ERD schema). This involve designing an ERD - Entity Relationship Diagram, this would create a link for integrating the all data in the staging. We move the data into ODS because its like a precursor before loading into the warehouse where we format, clean, rename the fields where necessary and it also serve operational purpose as teams can also query because it maintains similar schema to source systems

![](/images/blog/snowflake-dwh-modeling/dwh_ods.jpg)

Here we would transform staging data into the ERD for the ODS environment. 

```sql
-- ############## Business Table

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
    BUSINESS_ID,
    ADDRESS,
    CATEGORIES,
    CITY,
    HOURS,
    IS_OPEN,
    LATITUDE,
    LONGITUDE,
    NAME,
    POSTAL_CODE,
    REVIEW_COUNT,
    STARS,
    STATE,
    BYAPPOINTMENTONLY
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


-- ############## Users Table

DROP TABLE IF EXISTS YELP_PROJECT_DB.ODS.USERS;

CREATE TABLE YELP_PROJECT_DB.ODS.USERS (
    USER_ID                 STRING  PRIMARY KEY,
    AVERAGE_STARS           FLOAT,
    COMPLIMENT_COOL         INTEGER,
    COMPLIMENT_CUTE         INTEGER,
    COMPLIMENT_FUNNY        INTEGER,
    COMPLIMENT_HOT          INTEGER,
    COMPLIMENT_LIST         INTEGER,
    COMPLIMENT_MORE         INTEGER,
    COMPLIMENT_NOTE         INTEGER,
    COMPLIMENT_PHOTOS       INTEGER,
    COMPLIMENT_PLAIN        INTEGER,
    COMPLIMENT_PROFILE      INTEGER,
    COMPLIMENT_WRITER       INTEGER,
    COOL                    INTEGER,
    ELITE                   STRING,
    FANS                    INTEGER,
    FRIENDS                 STRING,
    FUNNY                   INTEGER,
    NAME                    STRING,
    REVIEW_COUNT            INTEGER,
    USEFUL                  INTEGER,
    YELPING_SINCE           TIMESTAMP
);

INSERT INTO YELP_PROJECT_DB.ODS.USERS (
    USER_ID,
    AVERAGE_STARS,
    COMPLIMENT_COOL,
    COMPLIMENT_CUTE,
    COMPLIMENT_FUNNY,
    COMPLIMENT_HOT,
    COMPLIMENT_LIST,
    COMPLIMENT_MORE,
    COMPLIMENT_NOTE,
    COMPLIMENT_PHOTOS,
    COMPLIMENT_PLAIN,
    COMPLIMENT_PROFILE,
    COMPLIMENT_WRITER,
    COOL,
    ELITE,
    FANS,
    FRIENDS,
    FUNNY,
    NAME,
    REVIEW_COUNT,
    USEFUL,
    YELPING_SINCE
)
SELECT
    data:user_id::STRING,
    data:average_stars::FLOAT,
    data:compliment_cool::INTEGER,
    data:compliment_cute::INTEGER,
    data:compliment_funny::INTEGER,
    data:compliment_hot::INTEGER,
    data:compliment_list::INTEGER,
    data:compliment_more::INTEGER,
    data:compliment_note::INTEGER,
    data:compliment_photos::INTEGER,
    data:compliment_plain::INTEGER,
    data:compliment_profile::INTEGER,
    data:compliment_writer::INTEGER,
    data:cool::INTEGER,
    data:elite::STRING,
    data:fans::INTEGER,
    data:friends::STRING,
    data:funny::INTEGER,
    data:name::STRING,
    data:review_count::INTEGER,
    data:useful::INTEGER,
    data:yelping_since::TIMESTAMP
FROM YELP_PROJECT_DB.STAGING.YELP_USER_DATA;

...

-- ##############-precip table
DROP TABLE IF EXISTS YELP_PROJECT_DB.ODS.PRECIPITATION;
CREATE TABLE YELP_PROJECT_DB.ODS.PRECIPITATION (
    DATE DATE PRIMARY KEY,
    PRECIPITATION STRING,
    PRECIPITATION_NORMAL FLOAT,
    CONSTRAINT fk_temp_date FOREIGN KEY (DATE) REFERENCES YELP_PROJECT_DB.ODS.DATE(DATE)
    
);
INSERT INTO YELP_PROJECT_DB.ODS.PRECIPITATION
SELECT
    TO_DATE(CAST(date AS VARCHAR), 'YYYYMMDD') AS date,
  precipitation,
  precipitation_normal
FROM YELP_PROJECT_DB.STAGING.PRECIPITATION;


```
We can see the output in the ODS layer

![](/images/blog/snowflake-dwh-modeling/dwh_ods_snflk.png)

![](/images/blog/snowflake-dwh-modeling/dwh_ods_samp.png)

#### Load the data from the ODS layer into the Warehouse layer

Finally we load the data into Data Warehouse environment. The data would be represented as a Star schema because the schema is efficient for querying data around fact and dimensions

![](/images/blog/snowflake-dwh-modeling/dwh_star_schema.jpg)

This migrate the data to the Data Warehouse layer.

```sql
-- ##############-Customer table
DROP TABLE IF EXISTS YELP_PROJECT_DB.DWH.DIM_CUSTOMER;
CREATE TABLE YELP_PROJECT_DB.DWH.DIM_CUSTOMER (
    USER_ID STRING PRIMARY KEY,
    AVERAGE_STARS FLOAT,
    COMPLIMENT_COOL INTEGER,
    COMPLIMENT_CUTE INTEGER,
    COMPLIMENT_FUNNY INTEGER,
    COMPLIMENT_HOT INTEGER,
    COMPLIMENT_LIST INTEGER,
    COMPLIMENT_MORE INTEGER,
    COMPLIMENT_NOTE INTEGER,
    COMPLIMENT_PHOTOS INTEGER,
    COMPLIMENT_PLAIN INTEGER,
    COMPLIMENT_PROFILE INTEGER,
    COMPLIMENT_WRITER INTEGER,
    COOL INTEGER,
    ELITE STRING,
    FANS INTEGER,
    FRIENDS STRING,
    FUNNY INTEGER,
    NAME STRING,
    REVIEW_COUNT INTEGER,
    USEFUL INTEGER,
    YELPING_SINCE TIMESTAMP
);
INSERT INTO YELP_PROJECT_DB.DWH.DIM_CUSTOMER
SELECT DISTINCT* FROM YELP_PROJECT_DB.ODS.USERS;

-- ##############-Business table
DROP TABLE IF EXISTS YELP_PROJECT_DB.DWH.DIM_BUSINESS;
CREATE TABLE YELP_PROJECT_DB.DWH.DIM_BUSINESS (
    BUSINESS_ID STRING PRIMARY KEY,
    ADDRESS STRING,
    CATEGORIES STRING,
    CITY STRING,
    HOURS STRING,
    IS_OPEN INTEGER,
    LATITUDE FLOAT,
    LONGITUDE FLOAT,
    NAME STRING,
    POSTAL_CODE STRING,
    REVIEW_COUNT INTEGER,
    STAR FLOAT,
    STATE STRING,
    BYAPPOINTMENTONLY STRING
);
INSERT INTO YELP_PROJECT_DB.DWH.DIM_BUSINESS
SELECT DISTINCT * FROM YELP_PROJECT_DB.ODS.BUSINESS;

-- ##############-Review table
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

...

-- ##############-Facts table
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
SELECT
DISTINCT
    R.BUSINESS_ID, 
    R.USER_ID, 
    R.REVIEW_ID, 
    R.DATE as REVIEW_DATE, 
    T.TIP_ID, 
    C.CHECKIN_ID, 
    CO.COV_ID
FROM YELP_PROJECT_DB.ODS.REVIEW R
JOIN YELP_PROJECT_DB.ODS.BUSINESS B ON R.BUSINESS_ID = B.BUSINESS_ID
JOIN YELP_PROJECT_DB.ODS.USERS U ON R.USER_ID = U.USER_ID
LEFT JOIN YELP_PROJECT_DB.ODS.TIPS T ON R.BUSINESS_ID = T.BUSINESS_ID AND R.USER_ID = T.USER_ID
LEFT JOIN YELP_PROJECT_DB.ODS.CHECK_IN C ON R.BUSINESS_ID = C.BUSINESS_ID AND R.DATE = C.DATE
LEFT JOIN YELP_PROJECT_DB.ODS.COVID CO ON R.BUSINESS_ID = CO.BUSINESS_ID;

```

We have the table transformed in the warehouse layer

![](/images/blog/snowflake-dwh-modeling/dwh_snw_table.png)

#### Test data warehouse with a query

Lastly we query the Data Warehouse to determine how weather affects Yelp reviews. This is to test our schema the accuracy and validity of the transformation we did.

For example this is a report showing the business name, temperature, precipitation, and ratings

```sql
SELECT
DISTINCT
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
JOIN YELP_PROJECT_DB.DWH.DIM_REVIEW R ON F.REVIEW_ID = R.REVIEW_ID

```

![](/images/blog/snowflake-dwh-modeling/dwh_query.png)

### Conclusion

This basically summarises the end to end stages for setting up data in Snowflake's data warehouse system. The infrastructure is essential for businesses who want to maximise their data and generate value for usecases such as analytics and AI.


### Resources
- Github repo - [link](https://github.com/ayotomiwasalau/datawarehousing)