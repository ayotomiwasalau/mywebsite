"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@lib/adminFetch";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

type ContentType = "Project" | "Blog";
type BodySource = "upload" | "editor";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeTag(rawTag: string) {
  return rawTag
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[,]+|[,]+$/g, "");
}

function safeFileName(fileName: string) {
  return fileName.trim().replace(/\s+/g, "-");
}

const IMAGE_EXT_FROM_SUFFIX: Record<string, string> = {
  jpeg: "jpg",
  jpg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
  svg: "svg",
};

/** Match backend ``assert_allowed_image_name``: ASCII basename ``[a-zA-Z0-9][…]{0,200}.ext``. */
function sanitizeImageFileName(original: string): string {
  const trimmed = safeFileName(original.replace(/^.*[/\\]/, ""));
  const lastDot = trimmed.lastIndexOf(".");
  const extRaw = lastDot >= 0 ? trimmed.slice(lastDot + 1).toLowerCase() : "";
  const canonicalExt = IMAGE_EXT_FROM_SUFFIX[extRaw];
  if (!canonicalExt) {
    throw new Error(`Unsupported image type: ${original}. Use png, jpg, webp, gif, or svg.`);
  }
  let stem = lastDot >= 0 ? trimmed.slice(0, lastDot) : trimmed;
  stem = stem
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^\.+|\.+$/g, "");
  if (!stem.length) stem = "image";
  if (!/^[a-zA-Z0-9]/.test(stem)) stem = `i${stem}`;
  stem = stem.slice(0, 201);
  return `${stem}.${canonicalExt}`;
}

function fileForImageUpload(file: File): File {
  const name = sanitizeImageFileName(file.name);
  if (name === file.name) return file;
  return new File([file], name, { type: file.type });
}

function imageAltFromFileName(fileName: string): string {
  const stem = fileName.replace(/^.*[/\\]/, "").replace(/\.[^.]+$/i, "");
  const words = stem.replace(/[-_\s]+/g, " ").trim();
  return words.length > 0 ? words : "Reference image";
}

function readTextFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read markdown file."));
    reader.readAsText(file);
  });
}

async function loadMarkdownFile(path: string) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load markdown file: ${path}`);
  }

  return response.text();
}

/** Document shape from ``GET /blogs/{slug}`` or ``GET /projects/{slug}`` (snake_case). */
interface ApiContentDocument {
  id: string;
  slug: string;
  title: string;
  header_img_url: string;
  header_img_alt: string;
  description: string;
  tags: string[];
  href: string;
  filepath_md: string;
  created_on: string;
  updated_on: string;
  feature: boolean;
  feat_order: number | null;
  shares: number;
  project_url?: string;
  blog_url?: string;
}

interface PersistedRecordMeta {
  id: string;
  created_on: string;
  shares: number;
  project_url: string;
  blog_url: string;
}

function parseUrlContentType(raw: string | null): ContentType | null {
  const t = raw?.toLowerCase();
  if (t === "blog") return "Blog";
  if (t === "project") return "Project";
  return null;
}

async function extractApiErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown };
    const detail = data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((entry) =>
          typeof entry === "object" && entry !== null && "msg" in entry
            ? String((entry as { msg: unknown }).msg)
            : JSON.stringify(entry),
        )
        .join(" ");
    }
    return response.statusText || `Request failed (${response.status}).`;
  } catch {
    return response.statusText || `Request failed (${response.status}).`;
  }
}

interface ImageWriteResponse {
  image_url: string;
}

async function uploadImageToApi(
  kind: "blog" | "project",
  slug: string,
  file: File,
): Promise<string> {
  const form = new FormData();
  form.append("kind", kind);
  form.append("slug", slug);
  form.append("file", file);

  const response = await adminFetch(`${FASTAPI_ROUTE_BASE}/images`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response));
  }
  const data = (await response.json()) as ImageWriteResponse;
  if (!data.image_url || typeof data.image_url !== "string") {
    throw new Error("Image upload succeeded but returned no image URL.");
  }
  return data.image_url;
}

export default function ContentEditorFlow() {
  const [contentType, setContentType] = useState<ContentType>("Project");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [feature, setFeature] = useState(false);
  const [featOrder, setFeatOrder] = useState<1 | 2 | 3 | "">("");
  const [headerImgAlt, setHeaderImgAlt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [markdownFile, setMarkdownFile] = useState<File | null>(null);
  const [bodySource, setBodySource] = useState<BodySource>("editor");
  const [bodyContent, setBodyContent] = useState("");
  const [existingCoverImagePath, setExistingCoverImagePath] = useState("");
  const [existingMarkdownFilePath, setExistingMarkdownFilePath] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  /** Slug used in ``PUT …/{slug}`` lookups; refreshed after successful save if slug changed. */
  const [editSourceSlug, setEditSourceSlug] = useState<string | null>(null);
  const [persistedRecord, setPersistedRecord] = useState<PersistedRecordMeta | null>(null);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const referenceInputRef = useRef<HTMLInputElement | null>(null);
  const markdownInputRef = useRef<HTMLInputElement | null>(null);
  const isPrefillingExistingContent = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get("type");
    const mode = params.get("mode")?.toLowerCase();
    const slugParam = params.get("slug");
    const contentTypeFromUrl = parseUrlContentType(typeParam);

    if (mode === "edit" && slugParam) {
      if (!contentTypeFromUrl) {
        setError("Edit mode requires a type query parameter (Blog or Project).");
        return;
      }

      let cancelled = false;
      isPrefillingExistingContent.current = true;
      setIsEditMode(true);
      setIsLoadingEdit(true);
      setContentType(contentTypeFromUrl);
      setSlugWasEdited(true);
      setError("");
      setPersistedRecord(null);
      setEditSourceSlug(null);

      const path =
        contentTypeFromUrl === "Blog"
          ? `${FASTAPI_ROUTE_BASE}/blogs/${encodeURIComponent(slugParam)}`
          : `${FASTAPI_ROUTE_BASE}/projects/${encodeURIComponent(slugParam)}`;

      void (async () => {
        try {
          const response = await fetch(path);

          if (!response.ok) {
            throw new Error(
              response.status === 404
                ? "No content found for this slug."
                : "Unable to load content from the server.",
            );
          }

          const doc = (await response.json()) as ApiContentDocument;
          if (cancelled) return;

          setPersistedRecord({
            id: doc.id,
            created_on:
              typeof doc.created_on === "string"
                ? doc.created_on
                : new Date(doc.created_on).toISOString(),
            shares: doc.shares,
            project_url: doc.project_url ?? "",
            blog_url: doc.blog_url ?? "",
          });
          setEditSourceSlug(doc.slug);
          setSlug(doc.slug);
          setTitle(doc.title);
          setDescription(doc.description);
          setFeature(Boolean(doc.feature));
          setFeatOrder(doc.feat_order === null ? "" : (doc.feat_order as 1 | 2 | 3));
          setHeaderImgAlt(doc.header_img_alt);
          setExistingCoverImagePath(doc.header_img_url);
          setExistingMarkdownFilePath(doc.filepath_md);
          setTags(doc.tags ?? []);
          setBodySource("editor");

          try {
            const markdown = await loadMarkdownFile(doc.filepath_md);
            if (!cancelled) setBodyContent(markdown);
          } catch (err) {
            if (!cancelled) {
              setBodyContent("");
              setError(err instanceof Error ? err.message : "Unable to load markdown file.");
            }
          }
        } catch (err) {
          if (!cancelled) {
            setIsEditMode(false);
            setError(err instanceof Error ? err.message : "Unable to load content.");
          }
        } finally {
          if (!cancelled) {
            setIsLoadingEdit(false);
            isPrefillingExistingContent.current = false;
          }
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    const type = typeParam?.toLowerCase();

    if (type === "blog") {
      setContentType("Blog");
      return;
    }

    if (type === "project") {
      setContentType("Project");
    }
  }, []);

  useEffect(() => {
    if (isPrefillingExistingContent.current) return;
    if (slugWasEdited) return;
    setSlug(slugify(title));
  }, [slugWasEdited, title]);

  useEffect(() => {
    if (!feature) {
      setFeatOrder("");
    }
  }, [feature]);

  const addTag = (raw: string) => {
    const next = normalizeTag(raw);
    if (!next) return;
    if (tags.some((tag) => tag.toLowerCase() === next.toLowerCase())) return;
    setTags((prev) => [...prev, next]);
    setTagDraft("");
  };

  const handleMarkdownFile = async (file: File | null) => {
    if (!file) return;
    if (!/\.(md|markdown|txt)$/i.test(file.name)) {
      setError("Please upload a markdown or text file.");
      return;
    }

    try {
      const text = await readTextFile(file);
      setMarkdownFile(file);
      setExistingMarkdownFilePath("");
      setBodySource("upload");
      setBodyContent(text);
      setError("");
      setSaveSuccess("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to read markdown file.");
    }
  };

  async function handleSave() {
    setSaveSuccess("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!bodyContent.trim()) {
      setError("Body content is required.");
      return;
    }
    if (feature && featOrder === "") {
      setError("Feature order is required when Feature item is Yes.");
      return;
    }

    const normalizedSlug = slugify(slug);
    if (!normalizedSlug) {
      setError("Slug must contain letters or numbers after normalization.");
      return;
    }

    const now = new Date().toISOString();
    const isBlog = contentType === "Blog";
    const imageKind: "blog" | "project" = isBlog ? "blog" : "project";
    const contentBasePath = contentType === "Blog" ? "/work/blogs" : "/work/projects";
    const markdownSubdir = contentType === "Blog" ? "markdowns/blog" : "markdowns/project";

    // Always write markdown filenames as `${slug}.md` when saving:
    // - Upload case: ignore the uploaded filename and force `${normalizedSlug}.md`
    // - Edit case: if the slug changed and the user didn't re-upload markdown, still rename to `${newSlug}.md`
    const forceSlugFilename =
      isEditMode && editSourceSlug !== null && normalizedSlug !== editSourceSlug;

    const markdownPath = markdownFile
      ? `/${markdownSubdir}/${normalizedSlug}.md`
      : forceSlugFilename
        ? `/${markdownSubdir}/${normalizedSlug}.md`
        : existingMarkdownFilePath || `/${markdownSubdir}/${normalizedSlug}.md`;
    const createdOn =
      isEditMode && persistedRecord ? persistedRecord.created_on : now;
    const shares = isEditMode && persistedRecord ? persistedRecord.shares : 0;
    const recordId =
      isEditMode && persistedRecord ? persistedRecord.id : crypto.randomUUID();

    const referenceFiles = [...referenceImages];

    try {
      setIsSaving(true);
      setError("");
      let coverImagePath = existingCoverImagePath;

      if (coverImage) {
        const coverFile = fileForImageUpload(coverImage);
        coverImagePath = await uploadImageToApi(imageKind, normalizedSlug, coverFile);
        setExistingCoverImagePath(coverImagePath);
      }

      if (!coverImagePath.trim()) {
        throw new Error(
          "Header image is required: enter an existing image path or upload a new cover image.",
        );
      }

      let bodyMarkdown = bodyContent;
      if (referenceFiles.length > 0) {
        const snippets: string[] = [];
        for (const raw of referenceFiles) {
          const refFile = fileForImageUpload(raw);
          const url = await uploadImageToApi(imageKind, normalizedSlug, refFile);
          const alt = imageAltFromFileName(refFile.name);
          snippets.push(`![${alt}](${url})`);
        }
        bodyMarkdown = `${bodyMarkdown.trimEnd()}\n\n${snippets.join("\n\n")}\n`;
      }

      const basePayload = {
        id: recordId,
        slug: normalizedSlug,
        title: title.trim(),
        header_img_url: coverImagePath.trim(),
        header_img_alt: headerImgAlt.trim() || title.trim(),
        description: description.trim(),
        tags,
        href: `${contentBasePath}/${normalizedSlug}`,
        filepath_md: markdownPath,
        created_on: createdOn,
        updated_on: now,
        feature,
        feat_order: feature ? Number(featOrder) : null,
        shares,
      };

      const apiPayload =
        contentType === "Blog"
          ? {
              ...basePayload,
              project_url:
                isEditMode && persistedRecord ? persistedRecord.project_url : "",
              body_markdown: bodyMarkdown,
            }
          : {
              ...basePayload,
              blog_url:
                isEditMode && persistedRecord ? persistedRecord.blog_url : "",
              body_markdown: bodyMarkdown,
            };

      if (isEditMode && persistedRecord !== null && editSourceSlug !== null) {
        const putPath =
          isBlog
            ? `${FASTAPI_ROUTE_BASE}/blogs/${encodeURIComponent(editSourceSlug)}`
            : `${FASTAPI_ROUTE_BASE}/projects/${encodeURIComponent(editSourceSlug)}`;
        const response = await adminFetch(putPath, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        });
        if (!response.ok) {
          throw new Error(await extractApiErrorMessage(response));
        }
        const json = (await response.json()) as {
          blog?: { slug: string; filepath_md?: string };
          project?: { slug: string; filepath_md?: string };
        };
        const savedSlug =
          isBlog ? json.blog?.slug ?? normalizedSlug : json.project?.slug ?? normalizedSlug;
        const savedPath = isBlog ? json.blog?.filepath_md : json.project?.filepath_md;
        setEditSourceSlug(savedSlug);
        setSlug(savedSlug);
        if (typeof savedPath === "string" && savedPath.trim()) {
          setExistingMarkdownFilePath(savedPath);
        }
        if (referenceFiles.length > 0) {
          setBodyContent(bodyMarkdown);
          setReferenceImages([]);
          if (referenceInputRef.current) referenceInputRef.current.value = "";
        }
        setSaveSuccess("Saved. Your changes are stored on the server.");
      } else {
        const postPath = isBlog ? `${FASTAPI_ROUTE_BASE}/blogs` : `${FASTAPI_ROUTE_BASE}/projects`;
        const response = await adminFetch(postPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        });
        if (!response.ok) {
          throw new Error(await extractApiErrorMessage(response));
        }
        const json = (await response.json()) as {
          blog?: { filepath_md?: string };
          project?: { filepath_md?: string };
        };
        const createdPath = isBlog ? json.blog?.filepath_md : json.project?.filepath_md;
        if (typeof createdPath === "string" && createdPath.trim()) {
          setExistingMarkdownFilePath(createdPath);
        }
        if (referenceFiles.length > 0) {
          setBodyContent(bodyMarkdown);
          setReferenceImages([]);
          if (referenceInputRef.current) referenceInputRef.current.value = "";
        }
        setSaveSuccess("Created successfully. You can open it again from Work Content.");
      }
    } catch (err) {
      setSaveSuccess("");
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="w-full bg-white px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-[980px]">
        <h1 className="text-[1.8rem] font-semibold text-[#111111]">
          {isEditMode ? "Edit Content" : "New Content"}
        </h1>
        <p className="mt-2 max-w-[760px] text-[0.95rem] text-[#4A5560]">
          Add metadata, attach images, set the markdown body, then save. Markdown is sent as{" "}
          <span className="font-mono text-[0.9em]">body_markdown</span> on the blog or project API and
          written to disk by the backend.
        </p>

        {isLoadingEdit ? (
          <div className="mt-6 rounded-xl bg-[#E8F4F7] px-4 py-3 text-[1rem] text-[#1F3440]">
            Loading content from the database…
          </div>
        ) : null}

        <div
          className={isLoadingEdit ? "pointer-events-none select-none opacity-55" : undefined}
          aria-busy={isLoadingEdit || undefined}
        >
        <div className="mt-8 rounded-2xl border border-[#E2E2E2] bg-white p-5">
          <h2 className="text-[1.25rem] font-semibold italic text-[#1F3440]">Metadata</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-[120px_1fr] md:items-center">
            <label className="text-[1rem] text-[#2E4653]">Type:</label>
            <div className="relative w-full max-w-[220px]">
              <select
                value={contentType}
                onChange={(event) => setContentType(event.target.value as ContentType)}
                className="h-10 w-full appearance-none rounded-md bg-[#3E8FA3] px-5 pr-10 text-[1rem] text-white outline-none"
              >
                <option value="Project">Project</option>
                <option value="Blog">Blog</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">
                <i className="fa-solid fa-chevron-down text-[0.75rem]" aria-hidden />
              </span>
            </div>

            <label className="text-[1rem] text-[#2E4653]">Title:</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter the title"
              className="h-11 w-full rounded-2xl border border-[#9A9A9A] bg-white px-5 text-[1rem] italic text-[#2E4653] outline-none focus:border-[#3E8FA3] focus:ring-2 focus:ring-[#3E8FA3]/20"
            />

            <label className="text-[1rem] text-[#2E4653]">Slug: </label>
            <input
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugWasEdited(true);
              }}
              placeholder="autogenerated"
              className="h-11 w-full rounded-2xl border border-[#9A9A9A] bg-white px-5 text-[1rem] italic text-[#2E4653] outline-none focus:border-[#3E8FA3] focus:ring-2 focus:ring-[#3E8FA3]/20"
            />

            <label className="text-[1rem] text-[#2E4653]">Description:</label>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter the description"
              className="h-11 w-full rounded-2xl border border-[#9A9A9A] bg-white px-5 text-[1rem] italic text-[#2E4653] outline-none focus:border-[#3E8FA3] focus:ring-2 focus:ring-[#3E8FA3]/20"
            />

            <label className="text-[1rem] text-[#2E4653]">Feature item:</label>
            <div className="relative w-full max-w-[220px]">
              <select
                value={feature ? "yes" : "no"}
                onChange={(event) => setFeature(event.target.value === "yes")}
                className="h-10 w-full appearance-none rounded-md bg-[#3E8FA3] px-5 pr-10 text-[1rem] text-white outline-none"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">
                <i className="fa-solid fa-chevron-down text-[0.75rem]" aria-hidden />
              </span>
            </div>

            {feature ? <label className="text-[1rem] text-[#2E4653]">Featured order:</label> : null}
            {feature ? (
              <div className="relative w-full max-w-[220px]">
                <select
                  value={featOrder === "" ? "" : String(featOrder)}
                  onChange={(event) => {
                    const next = event.target.value;
                    setFeatOrder(next === "" ? "" : (Number(next) as 1 | 2 | 3));
                  }}
                  className="h-10 w-full appearance-none rounded-md bg-[#3E8FA3] px-5 pr-10 text-[1rem] text-white outline-none"
                >
                  <option value="">Select order</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">
                  <i className="fa-solid fa-chevron-down text-[0.75rem]" aria-hidden />
                </span>
              </div>
            ) : null}

            <label className="text-[1rem] text-[#2E4653]">Image alt:</label>
            <input
              value={headerImgAlt}
              onChange={(event) => setHeaderImgAlt(event.target.value)}
              placeholder="Defaults to title"
              className="h-11 w-full rounded-2xl border border-[#9A9A9A] bg-white px-5 text-[1rem] italic text-[#2E4653] outline-none focus:border-[#3E8FA3] focus:ring-2 focus:ring-[#3E8FA3]/20"
            />

            <label className="text-[1rem] text-[#2E4653]">Tags:</label>
            <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-2xl border border-[#9A9A9A] bg-white px-4 py-2 focus-within:border-[#3E8FA3] focus-within:ring-2 focus-within:ring-[#3E8FA3]/20">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}
                  className="inline-flex h-7 items-center rounded-md bg-[#D1D1D1] px-3 text-[0.9rem] italic text-[#2E4653]"
                  aria-label={`Remove tag ${tag}`}
                >
                  {tag}
                </button>
              ))}
              <input
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addTag(tagDraft);
                  }
                  if (event.key === "Backspace" && tagDraft.length === 0 && tags.length > 0) {
                    setTags((prev) => prev.slice(0, -1));
                  }
                }}
                onBlur={() => addTag(tagDraft)}
                placeholder={tags.length === 0 ? "Add tags, press Enter" : ""}
                className="min-w-[160px] flex-1 bg-transparent text-[1rem] italic text-[#2E4653] outline-none placeholder:text-[#6B7C86]"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#E2E2E2] bg-white p-5">
          <h2 className="text-[1.25rem] font-semibold italic text-[#1F3440]">Uploads</h2>

          <div className="mt-5 grid gap-5 md:grid-cols-[160px_1fr] md:items-start">
            <label className="pt-2 text-[1rem] text-[#2E4653]">Cover Image:</label>
            <div className="space-y-3">
              <div>
                <p className="text-[0.85rem] text-[#627280]">
                  Use an image already in <span className="font-mono text-[0.9em]">public</span> (e.g.{" "}
                  <span className="font-mono text-[0.9em]">/images/blog/my-slug/cover.jpg</span>) or
                  upload a new file below.
                </p>
                <input
                  type="text"
                  value={existingCoverImagePath}
                  onChange={(event) => {
                    setExistingCoverImagePath(event.target.value);
                    setCoverImage(null);
                    if (coverInputRef.current) coverInputRef.current.value = "";
                  }}
                  placeholder="/images/blog/slug/cover.jpg or https://…"
                  className="mt-2 h-11 w-full rounded-2xl border border-[#9A9A9A] bg-white px-5 text-[1rem] italic text-[#2E4653] outline-none focus:border-[#3E8FA3] focus:ring-2 focus:ring-[#3E8FA3]/20"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    setCoverImage(event.target.files?.[0] ?? null);
                    setExistingCoverImagePath("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="h-10 min-w-[140px] rounded-2xl bg-[#DE5B6F] px-8 text-[1rem] font-medium text-white transition hover:opacity-90"
                >
                  Upload new
                </button>
                {coverImage ? (
                  <p className="text-[0.9rem] italic text-[#2E4653]">New file: {coverImage.name}</p>
                ) : null}
              </div>
              {!coverImage && existingCoverImagePath.trim() ? (
                <div className="overflow-hidden rounded-lg border border-[#E2E2E2] bg-[#F8FAFB]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={existingCoverImagePath.trim()}
                    alt={headerImgAlt.trim() || "Cover preview"}
                    className="max-h-40 w-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : null}
            </div>

            <label className="pt-2 text-[1rem] text-[#2E4653]">Reference Images:</label>
            <p className="-mt-1 text-[0.85rem] text-[#627280]">
              When you save, each file uploads like the cover image; image Markdown is appended at the end
              of the body so URLs are stored with the article.
            </p>
            <div>
              <input
                ref={referenceInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => setReferenceImages(Array.from(event.target.files ?? []))}
              />
              <button
                type="button"
                onClick={() => referenceInputRef.current?.click()}
                className="h-10 min-w-[140px] rounded-2xl bg-[#DE5B6F] px-8 text-[1rem] font-medium text-white transition hover:opacity-90"
              >
                Upload
              </button>
              {referenceImages.length > 0 ? (
                <ul className="mt-2 space-y-1 text-[0.9rem] italic text-[#2E4653]">
                  {referenceImages.map((file) => (
                    <li key={`${file.name}-${file.size}-${file.lastModified}`}>File: {file.name}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#E2E2E2] bg-white p-5">
          <h2 className="text-[1.25rem] font-semibold italic text-[#1F3440]">Body</h2>

          <div className="mt-4 flex flex-wrap gap-4 text-[1rem] text-[#2E4653]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bodySource === "upload"}
                onChange={() => setBodySource("upload")}
                className="h-4 w-4 accent-[#DE5B6F]"
              />
              Upload markdown file
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bodySource === "editor"}
                onChange={() => setBodySource("editor")}
                className="h-4 w-4 accent-[#DE5B6F]"
              />
              Write in editor
            </label>
          </div>

          {bodySource === "upload" ? (
            <div className="mt-5">
              <input
                ref={markdownInputRef}
                type="file"
                accept=".md,.markdown,.txt"
                className="hidden"
                onChange={(event) => {
                  void handleMarkdownFile(event.target.files?.[0] ?? null);
                }}
              />
              <button
                type="button"
                onClick={() => markdownInputRef.current?.click()}
                className="h-10 min-w-[170px] rounded-2xl bg-[#DE5B6F] px-8 text-[1rem] font-medium text-white transition hover:opacity-90"
              >
                Upload Markdown
              </button>
              {markdownFile ? (
                <p className="mt-2 text-[0.9rem] italic text-[#2E4653]">
                  File: {markdownFile.name}
                </p>
              ) : null}
              {!markdownFile && existingMarkdownFilePath ? (
                <p className="mt-2 text-[0.9rem] italic text-[#2E4653]">
                  Existing: {existingMarkdownFilePath}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5 rounded-sm border border-black/40 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
            <div className="flex flex-wrap items-center gap-1 border-b border-black/10 bg-white px-2 py-2">
              <span className="rounded-md border border-black/10 px-3 py-2 text-[0.9rem] font-medium text-[#444444]">
                Markdown
              </span>
              <div className="mx-1 h-7 w-px bg-black/10" aria-hidden />
              <span className="text-[0.85rem] italic text-[#6B7C86]">
                {bodySource === "upload"
                  ? "Uploaded markdown can still be edited before save."
                  : "Write markdown directly here."}
              </span>
            </div>
            <textarea
              value={bodyContent}
              onChange={(event) => setBodyContent(event.target.value)}
              className="min-h-[420px] w-full resize-y bg-white px-4 py-4 text-[1rem] text-[#1f1f1f] outline-none"
              aria-label="Markdown body content"
            />
          </div>
        </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl bg-[#FCE8EC] px-4 py-3 text-[0.95rem] text-[#8A2438]">
            {error}
          </div>
        ) : null}

        {saveSuccess ? (
          <div className="mt-6 rounded-xl bg-[#EAF6EF] px-4 py-3 text-[0.95rem] text-[#1F5A36]">
            {saveSuccess}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col justify-end gap-3 sm:flex-row">
          <Link
            href="/admin/workcontent"
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl border border-[#D16A79] text-[1.25rem] font-medium text-[#D16A79] transition hover:bg-[#D16A79]/10 sm:w-[220px]"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isLoadingEdit || isSaving}
            className="h-14 w-full rounded-2xl bg-[#D16A79] text-[1.25rem] font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-40 sm:w-[220px]"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </section>
  );
}
