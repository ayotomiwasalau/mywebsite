import { Suspense } from "react";
import ClientProject from "./ClientProject";
import LoadingPage from "../../../components/shared/LoadingPage";
import ErrorPage from "../../../components/shared/ErrorPage";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";
import { mergeWorkStaticParams } from "@lib/workStaticParams";
import { PostsSchema } from "../../../components/utils/interface";

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

function toProjectSchema(data: any): PostsSchema {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    imageSrc: data.header_img_url,
    timeAgo: data.created_on,
    tags: data.tags ?? [],
    filepath_md: data.filepath_md,
    likes: data.shares ?? 0,
    kind: "project",
    description: data.description,
    href: `/work/projects/${data.slug}`,
  };
}

async function getProject(slug: string): Promise<PostsSchema | null> {
  try {
    const response = await fetch(`${FASTAPI_ROUTE_BASE}/projects/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return toProjectSchema(data);
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  return mergeWorkStaticParams(
    "project",
    `${FASTAPI_ROUTE_BASE}/projects`,
    "projects",
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    return {
      title: "Project Not Found",
      description: "We couldn't find the project you are looking for.",
    };
  }

  const pageUrl = `https://ayotomiwasalau.com/work/projects/${slug}`;
  const fullImageUrl = project.imageSrc.startsWith("http")
    ? project.imageSrc
    : `https://ayotomiwasalau.com${project.imageSrc}`;

  return {
    title: project.title,
    description: "Data, AI, Cloud, Web and Blockchain",
    openGraph: {
      title: project.title,
      description: "Data, AI, Cloud, Web and Blockchain",
      url: pageUrl,
      type: "article",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 628,
          alt: `Image for ${project.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      description: "Data, AI, Cloud, Web and Blockchain",
      title: project.title,
      images: [fullImageUrl],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return <ErrorPage />;

  return (
    <Suspense fallback={<LoadingPage />}>
      <ClientProject project={project} />
    </Suspense>
  );
}
