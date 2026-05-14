import React from "react";
import AboutStackComponent, { AboutStackItem } from "./AboutStackComponent";

export interface AboutStackCategory {
  title: string;
  items: AboutStackItem[];
}

const CATEGORIES: AboutStackCategory[] = [
  {
    title: "Languages",
    items: [
      { name: "Python", logoSrc: "/stacklogo/techlogo/python.svg" },
      { name: "Java", logoSrc: "/stacklogo/techlogo/java.svg" },
      { name: "SQL", logoSrc: "/stacklogo/techlogo/sql.svg" },
      { name: "C++", logoSrc: "/stacklogo/techlogo/cpp.svg" },
      { name: "Typescript", logoSrc: "/stacklogo/techlogo/typescript.svg" },
    ],
  },
  {
    title: "Data & Streaming",
    items: [
      { name: "Apache Spark", logoSrc: "/stacklogo/techlogo/spark.svg" },
      { name: "Kafka", logoSrc: "/stacklogo/techlogo/kafka.svg" },
      { name: "Flink", logoSrc: "/stacklogo/techlogo/flink.svg" },
      { name: "dbt", logoSrc: "/stacklogo/techlogo/dbt.svg" },
      { name: "Airflow", logoSrc: "/stacklogo/techlogo/airflow.svg" },
    ],
  },
  {
    title: "Cloud & Infrastructure",
    items: [
      { name: "EMR", logoSrc: "/stacklogo/techlogo/emer.svg" },
      { name: "Lambda", logoSrc: "/stacklogo/techlogo/lambda.svg" },
      { name: "Kubernetes", logoSrc: "/stacklogo/techlogo/kubernetes.svg" },
      { name: "Docker", logoSrc: "/stacklogo/techlogo/docker.svg" },
      { name: "Azure", logoSrc: "/stacklogo/techlogo/azure.svg" },
    ],
  },
  {
    title: "Data Platforms",
    items: [
      { name: "Snowflake", logoSrc: "/stacklogo/techlogo/snowflake.svg" },
      { name: "Redshift", logoSrc: "/stacklogo/techlogo/redshift.svg" },
      { name: "Databricks", logoSrc: "/stacklogo/techlogo/databricks.svg" },
      { name: "Iceberg", logoSrc: "/stacklogo/techlogo/iceberg.svg" },
      { name: "Bigquery", logoSrc: "/stacklogo/techlogo/bigquery.svg" },
    ],
  },
  {
    title: "AI / ML",
    items: [
      { name: "RAG pipelines", logoSrc: "/stacklogo/techlogo/rag_pipeline.svg" },
      { name: "OpenAI", logoSrc: "/stacklogo/techlogo/openai.svg" },
      { name: "VectorDB", logoSrc: "/stacklogo/techlogo/chromadb.svg" },
      { name: "LLM agent", logoSrc: "/stacklogo/techlogo/smolagents.svg" },
    ],
  },
];

const AboutStackSection = () => {
  return (
    <section className="mb-12 md:mb-16">
      <h2 className="font-sans text-xl font-bold uppercase tracking-wide text-black md:text-2xl lg:text-3xl">
        Tech stack
      </h2>
      <p className="mb-8 mt-2 max-w-3xl text-sm leading-relaxed text-[#666666] md:mb-10 md:text-base">
        Tools and platforms I use to build scalable data, cloud, and AI solutions.
      </p>

      <div className="flex flex-col gap-8 md:gap-10">
        {CATEGORIES.map((category) => (
          <div key={category.title}>
            <h3 className="mb-3 font-mono text-sm font-bold text-[#333333] md:mb-4 md:text-base">
              {category.title}:
            </h3>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-7 md:gap-x-8 lg:gap-x-10">
              {category.items.map((item) => (
                <AboutStackComponent key={`${category.title}-${item.name}`} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutStackSection;
