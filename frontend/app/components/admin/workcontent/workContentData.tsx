export type WorkContentType = "Blog" | "Project";

export interface WorkContentItem {
  type: WorkContentType;
  title: string;
  slug: string;
  date: string;
  description: string;
  timeLabel: string;
  headerImgUrl: string;
  headerImgAlt: string;
  tags: string[];
  filepath_md: string;
}

export const WORK_CONTENT_ITEMS: WorkContentItem[] = [
  {
    type: "Blog",
    title: "Building scalable data pipelines",
    slug: "data-pipelines",
    date: "2026-03-12",
    description: "A practical walkthrough for building reliable batch and streaming data pipelines.",
    timeLabel: "8 min read",
    headerImgUrl: "/blogimages/pipeline.webp",
    headerImgAlt: "Data pipeline architecture diagram",
    tags: ["data-engineering", "pipelines", "architecture"],
    filepath_md: "/blogmarkdowns/streaming_as_a_service.md",
  },
  {
    type: "Project",
    title: "Realtime metrics dashboard",
    slug: "metrics-dashboard",
    date: "2026-03-10",
    description: "A dashboard for monitoring application metrics and operational signals in real time.",
    timeLabel: "Case study",
    headerImgUrl: "/blogimages/dashboard.jpg",
    headerImgAlt: "Realtime dashboard interface",
    tags: ["dashboard", "metrics", "frontend"],
    filepath_md: "/blogmarkdowns/big_data_jobs.md",
  },
  {
    type: "Blog",
    title: "Kafka consumer tuning",
    slug: "kafka-consumer-tuning",
    date: "2026-02-26",
    description: "Notes on tuning Kafka consumers for throughput, lag control, and predictable retries.",
    timeLabel: "6 min read",
    headerImgUrl: "/blogimages/kafka-data-streams.webp",
    headerImgAlt: "Kafka event streams illustration",
    tags: ["kafka", "streaming", "performance"],
    filepath_md: "/blogmarkdowns/kafka_python_lib.md",
  },
  {
    type: "Project",
    title: "Portfolio admin redesign",
    slug: "admin-redesign",
    date: "2026-02-18",
    description: "A redesign of the portfolio admin pages for content, images, messages, and subscribers.",
    timeLabel: "Case study",
    headerImgUrl: "/blogimages/dashboard.jpg",
    headerImgAlt: "Portfolio admin screen",
    tags: ["admin", "nextjs", "ui"],
    filepath_md: "/blogmarkdowns/testblog.md",
  },
  {
    type: "Blog",
    title: "Deploying Next.js on Firebase",
    slug: "nextjs-firebase",
    date: "2026-02-10",
    description: "A deployment guide for shipping a Next.js app with Firebase hosting workflows.",
    timeLabel: "7 min read",
    headerImgUrl: "/blogimages/containers.jpg",
    headerImgAlt: "Deployment workflow illustration",
    tags: ["nextjs", "firebase", "deployment"],
    filepath_md: "/blogmarkdowns/containers_kubernetes.md",
  },
  {
    type: "Project",
    title: "AI document search tool",
    slug: "ai-document-search",
    date: "2026-01-29",
    description: "A search experience for finding answers inside uploaded internal documents.",
    timeLabel: "Case study",
    headerImgUrl: "/blogimages/rag-api-doc.png",
    headerImgAlt: "AI document search interface",
    tags: ["rag", "search", "ai"],
    filepath_md: "/blogmarkdowns/chatpdfdoc_rag.md",
  },
  {
    type: "Blog",
    title: "Monitoring backend APIs",
    slug: "api-monitoring",
    date: "2026-01-22",
    description: "How to track API health using structured logs, metrics, and alerting.",
    timeLabel: "5 min read",
    headerImgUrl: "/blogimages/datareport.png",
    headerImgAlt: "API monitoring report",
    tags: ["api", "monitoring", "observability"],
    filepath_md: "/blogmarkdowns/mlflow_wandb.md",
  },
  {
    type: "Project",
    title: "Customer feedback dashboard",
    slug: "feedback-dashboard",
    date: "2026-01-15",
    description: "A dashboard for reviewing customer feedback trends and response priorities.",
    timeLabel: "Case study",
    headerImgUrl: "/blogimages/dashboard.jpg",
    headerImgAlt: "Customer feedback dashboard",
    tags: ["feedback", "dashboard", "analytics"],
    filepath_md: "/blogmarkdowns/dbt_workflow.md",
  },
  {
    type: "Blog",
    title: "Designing reliable webhooks",
    slug: "reliable-webhooks",
    date: "2026-01-08",
    description: "Patterns for retries, signing, idempotency, and observability in webhook systems.",
    timeLabel: "6 min read",
    headerImgUrl: "/blogimages/streamingsrvc_header_img.webp",
    headerImgAlt: "Webhook delivery architecture",
    tags: ["webhooks", "reliability", "backend"],
    filepath_md: "/blogmarkdowns/kafka-conf.md",
  },
  {
    type: "Project",
    title: "Content publishing workflow",
    slug: "content-workflow",
    date: "2025-12-28",
    description: "A workflow for drafting, previewing, and publishing portfolio content.",
    timeLabel: "Case study",
    headerImgUrl: "/blogimages/model_artefact.png",
    headerImgAlt: "Content workflow stages",
    tags: ["content", "workflow", "editor"],
    filepath_md: "/blogmarkdowns/testblog.md",
  },
];
