"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

type ImageKind = "blog" | "project";
type KindFilter = "all" | ImageKind;

interface ImageRow {
  kind: ImageKind;
  slug: string;
  image_name: string;
  image_url: string;
}

const ROWS_PER_PAGE = 8;

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

function deletingKey(row: Pick<ImageRow, "kind" | "slug" | "image_name">): string {
  return `${row.kind}\0${row.slug}\0${row.image_name}`;
}

export default function WorkImagesSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [uploadKind, setUploadKind] = useState<ImageKind>("blog");
  const [uploadSlug, setUploadSlug] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const response = await fetch(`${FASTAPI_ROUTE_BASE}/images`);
      if (!response.ok) {
        throw new Error(await extractApiErrorMessage(response));
      }
      const data = (await response.json()) as { images?: unknown };
      const raw = Array.isArray(data.images) ? data.images : [];
      const next: ImageRow[] = [];
      for (const item of raw) {
        if (
          typeof item !== "object" ||
          item === null ||
          !("kind" in item) ||
          !("slug" in item) ||
          !("image_name" in item) ||
          !("image_url" in item)
        ) {
          continue;
        }
        const r = item as Record<string, unknown>;
        const kind = r.kind === "blog" || r.kind === "project" ? r.kind : null;
        const slug = typeof r.slug === "string" ? r.slug : "";
        const image_name = typeof r.image_name === "string" ? r.image_name : "";
        const image_url = typeof r.image_url === "string" ? r.image_url : "";
        if (kind && slug && image_name && image_url) {
          next.push({ kind, slug, image_name, image_url });
        }
      }
      setRows(next);
    } catch (err) {
      setRows([]);
      setListError(err instanceof Error ? err.message : "Failed to load images.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredRows = rows.filter((row) => {
    const blob = `${row.slug} ${row.image_name} ${row.image_url}`.toLowerCase();
    const matchesSearch = !normalizedSearch || blob.includes(normalizedSearch);
    const matchesKind =
      kindFilter === "all" || row.kind === kindFilter;
    return matchesSearch && matchesKind;
  });

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const visibleRows = filteredRows.slice(startIndex, startIndex + ROWS_PER_PAGE);

  /** At most two consecutive page labels, always including ``currentPage``. */
  const visiblePageLabels =
    pageCount <= 1
      ? [1]
      : (() => {
          const start = Math.max(1, Math.min(currentPage, pageCount - 1));
          return [start, start + 1] as const;
        })();

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch, kindFilter]);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, Math.max(1, pageCount)));
  }, [pageCount]);

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    setUploadMessage("");
    if (!uploadSlug.trim()) {
      setUploadMessage("Slug is required.");
      return;
    }
    if (!uploadFile) {
      setUploadMessage("Choose an image file.");
      return;
    }
    setUploadBusy(true);
    try {
      const form = new FormData();
      form.append("kind", uploadKind);
      form.append("slug", uploadSlug.trim());
      form.append("file", uploadFile);

      const response = await fetch(`${FASTAPI_ROUTE_BASE}/images`, {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        throw new Error(await extractApiErrorMessage(response));
      }
      setUploadMessage("Uploaded.");
      setUploadFile(null);
      await loadImages();
    } catch (err) {
      setUploadMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadBusy(false);
    }
  }

  async function handleDelete(row: ImageRow) {
    const label = `${row.kind}/${row.slug}/${row.image_name}`;
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) {
      return;
    }
    const key = deletingKey(row);
    setDeleting(key);
    setListError("");
    try {
      const path = `${FASTAPI_ROUTE_BASE}/images/${row.kind}/${encodeURIComponent(row.slug)}/${encodeURIComponent(row.image_name)}`;
      const response = await fetch(path, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await extractApiErrorMessage(response));
      }
      await loadImages();
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="w-full bg-white px-6 py-12 sm:px-10">
      <div className="mx-auto w-full max-w-[900px]">
        <h1 className="text-[2rem] font-semibold text-[#111111]">Content Images</h1>
        <p className="mt-2 max-w-[640px] text-[0.95rem] text-[#4A5560]">
          Images under <span className="font-mono text-[0.88em]">/images/blog/…</span> and{" "}
          <span className="font-mono text-[0.88em]">/images/project/…</span> from the API. List and
          delete use the same routes as the content editor uploads.
        </p>

        <form
          onSubmit={(e) => void handleUpload(e)}
          className="mt-8 rounded-xl border border-[#E2E2E2] bg-[#F9FAFB] px-4 py-4 sm:px-5"
        >
          <h2 className="text-[1.1rem] font-semibold text-[#1F3440]">Upload image</h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex flex-col text-[0.85rem] text-[#2E4653]">
              Kind
              <select
                value={uploadKind}
                onChange={(e) => setUploadKind(e.target.value as ImageKind)}
                className="mt-1 h-10 rounded-lg border border-[#CBD5DD] bg-white px-2 text-[1rem] text-[#111]"
              >
                <option value="blog">Blog</option>
                <option value="project">Project</option>
              </select>
            </label>
            <label className="min-w-[200px] flex-1 flex flex-col text-[0.85rem] text-[#2E4653]">
              Slug
              <input
                type="text"
                value={uploadSlug}
                onChange={(e) => setUploadSlug(e.target.value)}
                placeholder="e.g. my-post-slug"
                className="mt-1 h-10 rounded-lg border border-[#CBD5DD] bg-white px-3 text-[1rem] text-[#111]"
              />
            </label>
            <label className="flex min-w-[200px] flex-1 flex-col text-[0.85rem] text-[#2E4653]">
              File
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="mt-1 text-[0.95rem] text-[#111]"
              />
            </label>
            <button
              type="submit"
              disabled={uploadBusy}
              className="h-10 min-w-[120px] rounded-2xl bg-[#DE5B6F] px-6 text-[1rem] font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {uploadBusy ? "Uploading…" : "Upload"}
            </button>
          </div>
          {uploadMessage ? (
            <p className="mt-2 text-[0.9rem] text-[#2E4653]" role="status">
              {uploadMessage}
            </p>
          ) : null}
        </form>

        <div className="mt-6 flex h-12 w-full items-center rounded-lg bg-[#AFC7D1] px-4">
          <i className="fa-solid fa-magnifying-glass text-[1.35rem] text-[#5A7A88]" aria-hidden />
          <input
            type="text"
            placeholder="Search slug, filename, URL"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className="ml-3 w-full bg-transparent text-[1.6rem] italic text-[#5B6E78] outline-none placeholder:text-[#5B6E78]"
          />
        </div>

        {listError ? (
          <p className="mt-4 rounded-lg bg-[#FCE8EC] px-3 py-2 text-[0.95rem] text-[#8B1538]" role="alert">
            {listError}
          </p>
        ) : null}

        <div className="mt-8 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setKindFilter("all");
              setCurrentPage(1);
            }}
            className="h-11 rounded-2xl text-[1rem] font-medium text-white transition hover:opacity-90 bg-[#D95A76]"
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setKindFilter("blog");
              setCurrentPage(1);
            }}
            className="h-11 rounded-2xl text-[1rem] font-medium text-white transition hover:opacity-90 bg-[#D95A76]"
          >
            Blogs
          </button>
          <button
            type="button"
            onClick={() => {
              setKindFilter("project");
              setCurrentPage(1);
            }}
            className="h-11 rounded-2xl text-[1rem] font-medium text-white transition hover:opacity-90 bg-[#D95A76]"
          >
            Projects
          </button>
        </div>

        <div className="mt-7 space-y-3">
          {loading ? (
            <p className="pt-3 text-center text-[1rem] text-[#4A4A4A]">Loading images…</p>
          ) : null}

          {!loading &&
            visibleRows.map((row) => (
              <div
                key={deletingKey(row)}
                className="flex min-h-[52px] flex-wrap items-center gap-2 sm:flex-nowrap"
              >
                <span className="h-3 w-3 shrink-0 rounded-full bg-[#7a7a7a]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[1rem] font-medium text-[#1f1f1f]">
                    <span className="text-[#4A686B]">{row.slug}</span>
                    <span className="text-[#9aa]"> · </span>
                    <span>{row.image_name}</span>
                  </p>
                  <a
                    href={row.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block max-w-full hyphens-none break-all text-[0.82rem] text-[#4A8EA6] underline decoration-[#4A8EA6]/60 [overflow-wrap:anywhere] hover:opacity-90 sm:truncate sm:whitespace-nowrap sm:[overflow-wrap:normal]"
                  >
                    {row.image_url}
                  </a>
                </div>
                <span className="shrink-0 rounded-md bg-[#4A8EA6] px-2.5 py-1 text-[0.8rem] font-medium lowercase text-white">
                  {row.kind}
                </span>
                <button
                  type="button"
                  disabled={deleting === deletingKey(row)}
                  onClick={() => void handleDelete(row)}
                  aria-label={`Delete ${row.image_name}`}
                  className="h-9 min-w-[86px] shrink-0 rounded-xl bg-[#D95A76] text-[0.95rem] text-white transition hover:opacity-90 disabled:opacity-45"
                >
                  <i className="fa-regular fa-trash-can" aria-hidden />
                </button>
              </div>
            ))}

          {!loading && visibleRows.length === 0 ? (
            <p className="pt-3 text-center text-[1rem] text-[#4A4A4A]">No matching images found.</p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[#111111] sm:gap-4">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="text-[1.8rem] transition disabled:opacity-35"
            aria-label="First page"
          >
            <i className="fa-solid fa-angles-left" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={currentPage === 1}
            className="text-[1.45rem] transition disabled:opacity-35"
            aria-label="Previous page"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>

          <span className="sr-only">
            Page {currentPage} of {pageCount}
          </span>
          {visiblePageLabels.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              aria-current={currentPage === page ? "page" : undefined}
              className={`h-12 min-w-[56px] rounded-2xl text-[1.35rem] text-[#111111] transition ${
                currentPage === page ? "bg-[#E5A999]" : "bg-[#F0C1B5]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(page + 1, pageCount))}
            disabled={currentPage === pageCount}
            className="text-[1.45rem] transition disabled:opacity-35"
            aria-label="Next page"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(pageCount)}
            disabled={currentPage === pageCount}
            className="text-[1.8rem] transition disabled:opacity-35"
            aria-label="Last page"
          >
            <i className="fa-solid fa-angles-right" />
          </button>
        </div>
      </div>
    </section>
  );
}
