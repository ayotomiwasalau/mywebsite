import { readdir } from "fs/promises";
import path from "path";

type WorkKind = "blog" | "project";

/** Slugs implied by shipped markdown under ``public/markdowns/{blog|project}/``. */
export async function slugsFromMarkdownFiles(kind: WorkKind): Promise<string[]> {
  const subdir = kind === "blog" ? "markdowns/blog" : "markdowns/project";
  const dir = path.join(process.cwd(), "public", subdir);
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".md"))
      .map((e) => e.name.replace(/\.md$/i, ""));
  } catch {
    return [];
  }
}

async function fetchAllSlugsFromList(
  listUrl: string,
  key: "blogs" | "projects",
): Promise<string[]> {
  const out: string[] = [];
  let page = 1;
  const perPage = 100;
  try {
    for (;;) {
      const url = `${listUrl}?page=${page}&per_page=${perPage}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) break;
      const data: unknown = await res.json();
      if (typeof data !== "object" || data === null) break;
      const raw = (data as Record<string, unknown>)[key];
      const items = Array.isArray(raw) ? raw : [];
      for (const item of items) {
        if (typeof item === "object" && item !== null && "slug" in item) {
          const slug = (item as { slug: unknown }).slug;
          if (typeof slug === "string" && slug.trim()) out.push(slug.trim());
        }
      }
      if (items.length < perPage) break;
      page += 1;
      if (page > 50) break;
    }
  } catch {
    // offline or API unreachable at build time
  }
  return out;
}

/**
 * Paths for ``output: 'export'``: union of API slugs and slugs from ``public`` markdown files
 * so local content is always pre-rendered even when the API is down or out of sync.
 */
export async function mergeWorkStaticParams(
  kind: WorkKind,
  listBaseUrl: string,
  responseKey: "blogs" | "projects",
): Promise<Array<{ slug: string }>> {
  const [apiSlugs, diskSlugs] = await Promise.all([
    fetchAllSlugsFromList(listBaseUrl, responseKey),
    slugsFromMarkdownFiles(kind),
  ]);
  const slugs = new Set<string>();
  for (const s of apiSlugs) slugs.add(s);
  for (const s of diskSlugs) slugs.add(s);
  return Array.from(slugs).map((slug) => ({ slug }));
}
