DBT is a data workflow tool designed mainly for transformation. It helps you transform data within a data storage. DBT is not the kind of tool that helps you extract data from database A to database B; instead, it simply connects to one database and transforms the data within it by running SQL statements to create tables and views. It basically handles the **T** in **ELT**.

DBT can connect to different storages such as Amazon Redshift, Google BigQuery, PostgreSQL, Snowflake, Starburst, and Trino, as well as query engines like Apache Spark. It can also be used in conjunction with orchestration tools like Airflow. DBT has the cloud version and the open-sourced core version which you can run on your local.

---

## Objective

The goal of this blog is to illustrate a case study where DBT is being used for transformation. We are going to use a Postgres database as our data warehouse. We will be utilizing the dbt core version for this article.

---

## Case Study

Here we are working with data from the [Open University Learning Analytics Dataset](https://www.kaggle.com/datasets/anlgrbz/student-demographics-online-education-dataoulad) (OULAD) from Kaggle.

![](/images/project/dbt-analytics-starter-kit/dbt_archi.webp)

We first need to extract this raw data into tables in a database. Since DBT does not handle extraction for us, we have to do it manually. We can either use a Python script via Pandas or import the raw file into tables using a DBMS CSV import tool.

When you have extracted your data, it should look like this in the database:

![](/images/project/dbt-analytics-starter-kit/dbt_extract.webp)

---

## Setting Up the Environment

Next, create a Python virtual environment. This is very useful as it encapsulates all your project dependencies. I used Anaconda as my base data science package tool; it is an open-source package distribution that helps with environment management.

```bash
conda create --name dbtenv python=3.10
conda activate dbtenv
```

When the env is successfully created, it should look like this:

![](/images/project/dbt-analytics-starter-kit/dbt_env_crtd.webp)

---

## Installing DBT Core and Postgres Adapter

Here we are installing dbt core and the Postgres adapter locally:

```bash
pip install dbt-core dbt-postgres
```

Navigate to your project folder — `project_dbt` — and initialize dbt:

```bash
dbt init project_1
```

![](/images/project/dbt-analytics-starter-kit/dbt_proj_dir.webp)

---

## Configuring the Profile

We updated the `profile.yml` file in `.dbt` in the home folder (i.e. `cd ~`). This is for defining the database details. The file was created after initializing the dbt project:

```yaml
project_1:
  outputs:
    dev:
      type: postgres
      threads: 1
      host: localhost
      port: 5432
      user: ayotomiwasalau
      pass: ""
      dbname: datadb
      schema: warehouse
  target: dev
```

---

## Models

The `models` folder is the location for defining all the models/schema. Dbt compiles the defined model and outputs the resulting file in the `target` folder.

We have three categories of models in this project:
- **Raw**
- **Staging**
- **Production**

### Raw Model
The raw model is from the source CSV files, it is as it is, with no changes. Have a look at the model below:

![](/images/project/dbt-analytics-starter-kit/dbt_schema_model.webp)

### Staging Model
The next is the staging model. A couple of tables and fields have been dropped such as `vle` and `student_vle` as we don't need these tables in the core transformation.

![](/images/project/dbt-analytics-starter-kit/dbt_staging.webp)

### Production Model
The production model is the transformed model with changes to the schema. Some tables have been combined and aggregated to represent the data as fact and dimensions (i.e. measures and characteristics).

![](/images/project/dbt-analytics-starter-kit/dbt_prod_model.webp)

---

## Model Definition Files

These are the model definition files for staging and production with the respective SQL statements for each table represented in the dbt folder.

![](/images/project/dbt-analytics-starter-kit/dbt_model_def.webp)

You define the source of the raw tables in a YAML file. This helps us reference the source table names in our queries using Jinja templates.

**warehouse_source.yml**

```yaml
version: 2
sources:
  - name: raw
    database: datadb
    tables:
      - name: assessments
      - name: courses
      - name: student_assessment
      - name: student_info
      - name: student_registration
      - name: student_vle
      - name: vle
```

The queries for defining the tables and views are saved in the models folder. Below are examples of the models defined and the corresponding documentation YAML file that also has tests.

**assessments_stg.sql**

```sql
{{ config(materialized='view', schema='staging') }}

SELECT * 
FROM {{ source('raw', 'assessments') }}
```

**assessments_stg.yml**

```yaml
version: 2
models:
  - name: assessments_stg
    description: "information about assessments in module-presentations. Usually, every presentation has a number of assessments followed by the final exam."
    columns:
      - name: code_module
        description: "An identification code for a module on which the student is registered."
        tests:
          - not_null
      - name: code_presentation
        description: "The identification code of the presentation during which the student is registered on the module."
      - name: id_assessment
        description: "Identification number of the assessment."
      - name: assessment_type
        description: "Type of assessment."
      - name: date
        description: "Information about the final submission date of the assessment calculated as the number of days since the start of the module-"
      - name: weight
        description: "Weight of the assessment in %"
```

**student_registration_stg.sql**

```sql
{{ config(materialized='view', schema='staging') }}

SELECT * 
FROM {{ source('raw', 'student_registration') }}
```

**student_registration_stg.yml**

```yaml
version: 2
models:
  - name: student_registration_stg
    description: "information about the time when the student registered for the module presentation. For students who unregistered the date of deregistration is also recorded."
    columns:
      - name: code_module
        description: "An identification code for a module on which the student is registered."
        tests:
          - not_null
      - name: code_presentation
        description: "The identification code of the presentation during which the student is registered on the module."
      - name: id_student
        description: "A unique identification number for the student."
      - name: date_registration
        description: "The date of student’s registration on the module presentation, this is the number of days measured relative to the start of the module-presentation (e.g. the negative value -30 means that the student registered to module presentation 30 days before it started)."
      - name: date_unregistration
        description: "Date of student unregistration from the module presentation, this is the number of days measured relative to the start of the module-presentation. Students, who completed the course have this field empty. Students who unregistered have Withdrawal as the value of the final_result column in the studentInfo.csv file."
```

**student_fact.sql**

```sql
{{ config(materialized='table', schema='production') }}

SELECT 
    si.id_student,
    si.code_module,
    si.code_presentation,
    si.num_of_prev_attempts,
    si.studied_credits,
    si.final_result,
    COUNT(sa.id_assessment) as number_of_assessments_done
FROM {{ ref("student_info_stg") }} si
LEFT JOIN {{ ref("student_assessment_stg") }} sa ON si.id_student = sa.id_student
GROUP BY 
    si.id_student,
    si.code_module,
    si.code_presentation,
    si.num_of_prev_attempts,
    si.studied_credits,
    si.final_result
```

**student_fact.yml**

```yaml
version: 2
models:
  - name: student_fact
    description: "fact about students and related courses"
    columns:
      - name: id_student
        description: "A unique identification number for the student."
        tests:
          - relationships:
              to: ref('student_detail_dim')
              field: id_student
      - name: code_module
        description: "An identification code for a module on which the student is registered."
        tests:
          - not_null
      - name: code_presentation
        description: "The identification code of the presentation during which the student is registered on the module."
      - name: num_of_prev_attempts
        description: "The number times the student has attempted this module."
      - name: studied_credits
        description: "The total number of credits for the modules the student is currently studying."
      - name: final_result
        description: "Student's final result in the module-presentation"
      - name: number_of_assessments_done
        description: "Number of assessments done in the module"
```

One noticeable thing is the Jinja templates `{{ }}` are used virtually everywhere in dbt: in defining models, tests, macros, etc. It helps with templating and referencing, and also reduces the amount of code needed. Here is the GitHub repo to the codebase.

Once we have defined all the models, we then run:

```bash
dbt run
```

to run the SQL statements according to the defined models and create the tables and views in the Postgres database. Choose `dbt run` when your focus is on updating the transformed datasets and you don’t need to reseed data, capture snapshots, or run tests. Choose `dbt build` when you want a comprehensive execution of your entire dbt workflow.

```bash
dbt build
```

![](/images/project/dbt-analytics-starter-kit/dbt_output.webp)

This is what the data looks like in the database:

![](/images/project/dbt-analytics-starter-kit/dbt_folder_output.webp)

![](/images/project/dbt-analytics-starter-kit/dbt_db_output0.webp)

![](/images/project/dbt-analytics-starter-kit/dbt_db_output1.webp)

---

## Materializations

There are different ways to define the materialization of data using dbt. This includes:
- **view**
- **table**
- **incremental**
- **ephemeral**

### Views
In dbt, a view is a virtual table created by an SQL query, which does not store the data physically but generates results dynamically at runtime, promoting simplicity and reusability in data access.

### Tables
Tables in dbt are a materialization strategy where query results are physically stored in the database, providing performance benefits for large or complex transformations at the cost of increased storage and potential maintenance overhead.

### Incremental
Incremental models in dbt allow for efficient updating of large datasets by only adding or updating new or changed data based on a defined unique key and filter, reducing run time and resource usage.

### Ephemeral
Ephemeral models in dbt are non-materialized transformations that simplify complex logic, with their results being used exclusively in subsequent models without creating additional database objects.

You can define the materializations in the model files or in the `project.yml` created at initialization. I prefer defining it in the model SQL files.

```sql
{{ config(materialized='view', schema='staging') }}
```

or

```yaml
models:
  warehouse:
    # Config indicated by + and applies to all files under models/example/
    staging:
      +materialized: table # incremental or ephemeral
    production:
      +materialized: view
```

---

## Data Quality Test

It is important to test your data to ensure your data maintains its integrity and remains accurate.

There are three methods of testing in DBT:
- **Inbuilt**
- **Generic**
- **Custom**

### Inbuilt
Involves using the provided inbuilt methods by applying them to the model columns. Examples of the inbuilt methods are not_null checks, accepted_value, relationships integrity, unique values, etc.

```yaml
models:
  - name: student_fact
    description: "fact about students and related courses"
    columns:
      - name: id_student
        description: "A unique identification number for the student."
        tests:
          - relationships:
              to: ref('student_detail_dim')
              field: id_student
```

```yaml
models:
  - name: student_detail_dim
    description: "demographic information about the students."
    columns:
      - name: id_student
        description: "A unique identification number for the student."
        tests:
          - not_null
      - name: gender
        description: "The student's gender."
        tests:
          - accepted_values:
              values: ['M', 'F']
```

### Generic
Generic involves defining the template test that can be applied to multiple columns. Here the test checks the column to make sure it contains only integers, not strings.

```jinja
{% test contains_only_integers(model, column_name) %}
    SELECT {{column_name}}
    FROM {{model}}
    WHERE {{column_name}} ~ '^\\d+$'
{% endtest %}
```

```yaml
models:
  - name: courses_fact
    description: "fact about courses taken by students"
    columns:
      - name: code_module
        description: "An identification code for a module on which the student is registered."
        tests:
          - contains_only_integers
```

### Custom
Finally, the custom test template is for testing a specific business logic, to ensure the data is trustworthy and logical in the context of the business. For example, this test checks to ensure a student has no negative value in the number of assessments done because it does not make sense to have a negative value.

**student_not_registered_no_assessment.sql**

```sql
SELECT id_student
FROM {{ ref("student_fact")}}
WHERE number_of_assessments_done < 0
LIMIT 5
```

To run all your tests:

```bash
dbt test
```

Below shows when a test passes and when a test fails:

![](/images/project/dbt-analytics-starter-kit/dbt_test.webp)

![](/images/project/dbt-analytics-starter-kit/dbt_test1.webp)

---

## Macros

Dbt enables us to use macros, which are reusable pieces of SQL code that can be invoked in various parts of a dbt project to encapsulate logic, enforce consistency, and simplify complex SQL operations, ultimately enhancing maintainability and code reusability.

Here we used a macro that modifies the name of the schema to be defined in the database. This excludes the inclusion of a hyphen that concatenates the name with the defined default schema name in the `profile.yml` file.

```jinja
-- https://docs.getdbt.com/docs/build/custom-schemas
{% macro generate_schema_name(custom_schema_name, node) -%}
    {%- set default_schema = target.schema -%}
    {%- if custom_schema_name is none -%}
        {{ default_schema }}
    {%- else -%}
        {{ custom_schema_name | trim }}
    {%- endif -%}
{%- endmacro %}
```

---

## Maintaining Models

In maintaining models, maybe we want to update a schema by adding a new table, refreshing the tables, and dropping and recreating views. This would involve applying changes to cascading views. Dbt provides commands we can simply call in a dbt directory.

- To refresh a particular model:

  ```bash
  dbt run --models production
  ```

  ![](/images/project/dbt-analytics-starter-kit/dbt_model_prod.webp)

- To refresh a particular table or view:

  ```bash
  dbt run --models warehouse.production.student_fact
  ```

  ![](/images/project/dbt-analytics-starter-kit/dbt_referesh_view.webp)

- To refresh downstream tables or views (i.e. entities that are dependent on that view or table), the plus sign (+) at the front indicates downstream:

  ```bash
  dbt run --models warehouse.staging.student_info_stg+
  ```

  ![](/images/project/dbt-analytics-starter-kit/dbt_referesh_downstream.webp)

- To refresh the upstream tables, the plus sign is placed back:

  ```bash
  dbt run --models +warehouse.staging.student_info_stg
  ```

  ![](/images/project/dbt-analytics-starter-kit/dbt_refresh_upstream.webp)

- You run this command to debug your entire setup:

  ```bash
  dbt debug
  ```
  ![](/images/project/dbt-analytics-starter-kit/dbt_debug.webp)

- You can also run `dbt run --full-refresh` for a full refresh.

---

## Generating Documentation

dbt enables us to generate documentation for our models, tables, and views. We have to fill the `.yml` files in the models folder, then we run the command below and it generates a `catalog.json` file in the target folder:

```bash
dbt docs generate
```

---

That brings this article to an end. We have seen how to implement dbt in our data transformation project. [GitHub project repo](https://github.com/ayotomiwasalau/dbt-transformation). This article does not cover the dbt cloud usage; you have a look here for more info.

