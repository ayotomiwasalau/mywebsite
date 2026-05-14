import React from "react";
import ExperienceComponent, { ExperienceEntry } from "./ExperienceComponent";

/** Work history highlights (resume-aligned where noted). */
const ENTRIES: ExperienceEntry[] = [
  {
    company: "Moniepoint",
    companyUrl: "https://moniepoint.com",
    role: "Senior Data Engineer",
    dateRange: "Nov 2025 - Present",
    timezone: "GMT +1 (EMEA)/GMT +1 (UK)",
    logoSrc: "/stacklogo/aboutme/work_moniepoint.jpeg",
    highlights: [
      "Design and maintain high-volume Airflow pipelines for financial reconciliation and settlement processing.",
      "Analyze large datasets with Python and SQL; optimize models and platform performance for speed, scalability, and cost on ClickHouse.",
      "Partner with cross-functional teams on data quality, reporting reliability, and business data needs.",
    ],
  },
  {
    company: "Bravely",
    companyUrl: "https://www.workbravely.com",
    role: "Senior Data Engineer",
    dateRange: "Oct 2023 - June 2025",
    timezone: "GMT -5 (America/New_York)",
    logoSrc: "/stacklogo/aboutme/work_bravely.jpeg",
    highlights: [
      "Built ETL for sentiment analysis on unstructured feedback using Airflow and Hugging Face BERT, with Tableau dashboards delivering ~98% accurate insights.",
      "Reduced pipeline breakage ~85% with a Python CLI (N-ary trees, hash maps, Pandas) to manage model dependencies in Airflow as an alternative to dbt.",
      "Ran daily Redshift data-quality checks in Airflow; evaluated Snowflake with star-schema design; shipped a C++ ingestion engine ~25% faster than the legacy path.",
    ],
  },
  {
    company: "Andela",
    companyUrl: "https://andela.com",
    role: "Senior Engineer (Contract)",
    dateRange: "Sep 2023 - June 2025 · Remote",
    timezone: "GMT +1 (EMEA)",
    logoSrc: "/stacklogo/aboutme/work_andela.jpeg",
    highlights: [
      "Hired by Andela as an independent contractor and placed with external clients such as Bravely.",
      "Delivered high-quality engineering outcomes leveraging cloud native data tools and best practices.",
    ],
  },
  {
    company: "Symphony Solutions",
    companyUrl: "https://symphony-solutions.com",
    role: "Big Data Engineer",
    dateRange: "Dec 2022 - Oct 2023",
    timezone: "GMT +2 (Europe/Amsterdam)",
    logoSrc: "/stacklogo/aboutme/work_symphony_solutions.jpeg",
    highlights: [
      "Implemented Kafka Streams (Java) to ingest OpenTelemetry data into Druid on Azure; integrated Prometheus/Grafana for SLI/SLO visibility.",
      "Built Java Spring Boot REST services with Keycloak and PostgreSQL (Gradle, Flyway); JUnit coverage for REST and Kafka Streams paths.",
      "Delivered GCP Pub/Sub ingestion for marketing data (Salesforce, HubSpot, Albacross) through DataProc into BigQuery; Kimball-style OLAP with DBT and Looker for campaigns.",
    ],
  },
  {
    company: "Tiptier",
    companyUrl: "https://tiptier.co",
    role: "Technical Founder",
    timezone: "GMT +1 (EMEA)",
    dateRange: "Oct 2022 - Present",
    logoSrc: "/stacklogo/aboutme/work_tiptier.jpeg",
    highlights: [
      "Founded and lead engineering for a software practice that builds cloud data and AI infrastructure for client teams.",
      "Scope end-to-end delivery: solution architecture, implementation, and operations for analytics pipelines, data platforms, and related cloud workloads.",
      "Partner with organizations on technical strategy, hands-on build, and consulting as they modernize data and AI capabilities.",
    ],
  },
  {
    company: "Indicina",
    companyUrl: "https://indicina.co",
    role: "Lead Data Engineer",
    dateRange: "Jun 2021 - Aug 2023",
    timezone: "GMT +1 (EMEA)",
    logoSrc: "/stacklogo/aboutme/work_indicina.jpeg",
    highlights: [
      "Ran Spark (Scala) on EMR for MapReduce-style jobs exceeding 5B rows/day, improving turnaround time ~50%.",
      "Automated ML retraining end-to-end (Airflow on EKS, EMR, SageMaker, Slack alerts)—cut data-scientist manual effort from days to minutes.",
      "Built an S3 data lake with DMS, CDC, Spark, Glue, and Athena/Metabase—~70% improvement in cross-team accessibility and self-service analytics.",
    ],
  },
  {
    company: "KPMG Digital",
    companyUrl: "https://kpmg.com",
    role: "Data Specialist",
    timezone: "GMT +1 (EMEA)",
    dateRange: "Sep 2018 - May 2020",
    logoSrc: "/stacklogo/aboutme/work_kpmg.jpeg",
    highlights: [
      "Delivered ETL for audit and fraud analytics using Azure Data Factory, Synapse, T-SQL, and MS SQL Server on high-volume transactional data.",
      "Automated Oracle ingestion with SQL stored procedures; validation workflows (IDea & VBA) that sped Power BI reporting ~30%.",
      "Led NDPR, GDPR, and ISO 27001 data-governance reviews for telecom and banking clients; designed remediation to strengthen compliance and reduce audit risk.",
    ],
  },
];

const ExperienceSection = () => {
  return (
    <section className="mb-12 md:mb-16">
      <h2 className="text-xl font-bold uppercase tracking-wide text-black md:text-2xl lg:text-3xl">
        Impact &amp; Experience
      </h2>
      <p className="mb-10 mt-2 max-w-3xl text-sm leading-relaxed text-[#666666] md:mb-12 md:text-base">
        Selected roles and outcomes across fintech, cloud data platforms, and AI projects.
      </p>

      <div className="flex flex-col gap-12 md:gap-14 lg:gap-16">
        {ENTRIES.map((entry) => (
          <ExperienceComponent key={entry.company + entry.dateRange} entry={entry} />
        ))}
      </div>
    </section>
  );
};

export default ExperienceSection;
