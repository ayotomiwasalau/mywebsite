import { Suspense } from "react";
import ClientPost from "./ClientPost";
import LoadingPage from "../../../components/shared/LoadingPage";
import ErrorPage from "../../../components/shared/ErrorPage";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";
import { mergeWorkStaticParams } from "@lib/workStaticParams";
import { PostsSchema } from "../../../components/utils/interface";

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

function toPostSchema(data: any): PostsSchema {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    imageSrc: data.header_img_url,
    timeAgo: data.created_on,
    tags: data.tags ?? [],
    filepath_md: data.filepath_md,
    likes: data.shares ?? 0,
    kind: "blog",
    description: data.description,
    href: `/work/blogs/${data.slug}`,
  };
}

async function getBlog(slug: string): Promise<PostsSchema | null> {
  try {
    const response = await fetch(`${FASTAPI_ROUTE_BASE}/blogs/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return toPostSchema(data);
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  return mergeWorkStaticParams("blog", `${FASTAPI_ROUTE_BASE}/blogs`, "blogs");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlog(slug);
  if (!post) {
    return {
      title: "Post Not Found",
      description: "We couldn't find the post you are looking for.",
    };
  }

  const pageUrl = `https://ayotomiwasalau.com/work/blogs/${slug}`;
  const fullImageUrl = post.imageSrc.startsWith("http")
    ? post.imageSrc
    : `https://ayotomiwasalau.com${post.imageSrc}`;

  return {
    title: post.title,
    description: "Data, AI, Cloud, Web and Blockchain",
    openGraph: {
      title: post.title,
      description: "Data, AI, Cloud, Web and Blockchain",
      url: pageUrl,
      type: "article",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 628,
          alt: `Image for ${post.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      description: "Data, AI, Cloud, Web and Blockchain",
      title: post.title,
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
  const post = await getBlog(slug);
  if (!post) return <ErrorPage />;

  return (
    <Suspense fallback={<LoadingPage />}>
      <ClientPost post={post} />
    </Suspense>
  );
}
