"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { adminFetch } from "@lib/adminFetch";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

const CELL_CLASS = "min-h-[56px] bg-[#B8CFD8] px-3 py-2 text-[1rem] text-[#1f1f1f]";
const ROWS_PER_PAGE = 7;

/** Admin list row: blog post vs portfolio project (matches editor `type` query). */
type WorkContentType = "Blog" | "Project";

type ContentFilter = "blog" | "project";

interface WorkTableRow {
  type: WorkContentType;
  title: string;
  slug: string;
  date: string;
}

interface ApiBlogBrief {
  title: string;
  slug: string;
  created_on: string;
}

interface BlogListPayload {
  blogs: ApiBlogBrief[];
}

interface ApiProjectBrief {
  title: string;
  slug: string;
  created_on: string;
}

interface ProjectListPayload {
  projects: ApiProjectBrief[];
}

function formatApiDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
}

interface DeleteConfirmationTarget {
  type: WorkContentType;
  slug: string;
  title: string;
}

export default function WorkContentSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContentFilter>("blog");
  const [rows, setRows] = useState<WorkTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [listReloadKey, setListReloadKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<DeleteConfirmationTarget | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadList() {
      setIsLoading(true);
      setRows([]);
      try {
        if (typeFilter === "blog") {
          const response = await fetch(`${FASTAPI_ROUTE_BASE}/blogs?per_page=100`);

          if (!response.ok) {
            throw new Error("Unable to load blogs.");
          }

          const data = (await response.json()) as BlogListPayload;
          if (!isMounted) return;

          setRows(
            data.blogs.map((blog) => ({
              type: "Blog" as const,
              title: blog.title,
              slug: blog.slug,
              date: formatApiDate(blog.created_on),
            })),
          );
        } else {
          const response = await fetch(`${FASTAPI_ROUTE_BASE}/projects?per_page=100`);

          if (!response.ok) {
            throw new Error("Unable to load projects.");
          }

          const data = (await response.json()) as ProjectListPayload;
          if (!isMounted) return;

          setRows(
            data.projects.map((project) => ({
              type: "Project" as const,
              title: project.title,
              slug: project.slug,
              date: formatApiDate(project.created_on),
            })),
          );
        }
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setRows([]);
        setError(err instanceof Error ? err.message : "Unable to load content.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadList();

    return () => {
      isMounted = false;
    };
  }, [typeFilter, listReloadKey]);

  useEffect(() => {
    if (!deleteTarget) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isDeleting) return;
        setDeleteTarget(null);
        setDeleteError("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteTarget, isDeleting]);

  function closeDeleteModal() {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError("");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError("");
    setIsDeleting(true);
    try {
      const encoded = encodeURIComponent(deleteTarget.slug);
      const path =
        deleteTarget.type === "Blog"
          ? `${FASTAPI_ROUTE_BASE}/blogs/${encoded}`
          : `${FASTAPI_ROUTE_BASE}/projects/${encoded}`;
      const response = await adminFetch(path, { method: "DELETE" });

      if (!response.ok) {
        const message =
          deleteTarget.type === "Blog"
            ? "Unable to delete this blog post."
            : "Unable to delete this project.";
        throw new Error(message);
      }

      setDeleteTarget(null);
      setListReloadKey((key) => key + 1);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  function rowMatchesSearch(row: WorkTableRow) {
    const haystack = `${row.title} ${row.slug} ${row.date}`.toLowerCase();
    return haystack.includes(normalizedSearchTerm);
  }

  const filteredRows = rows.filter(rowMatchesSearch);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, pageCount);
  const startIndex = (safePage - 1) * ROWS_PER_PAGE;
  const visibleRows = filteredRows.slice(startIndex, startIndex + ROWS_PER_PAGE);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  return (
    <section className="w-full bg-white px-6 py-12 sm:px-10">
      <div className="mx-auto w-full max-w-[900px]">
        <h1 className="text-[2rem] font-semibold text-[#111111]">Work Content</h1>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/admin/editor?type=Blog"
            className="inline-flex h-11 min-w-[146px] items-center justify-center rounded-2xl bg-[#D95A76] px-5 text-[1.2rem] font-medium text-white transition hover:opacity-90"
          >
            New Blog
          </Link>
          <Link
            href="/admin/editor?type=Project"
            className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-2xl bg-[#D95A76] px-5 text-[1.2rem] font-medium text-white transition hover:opacity-90"
          >
            New Project
          </Link>
        </div>

        <div className="mt-8 flex h-12 w-full items-center rounded-lg bg-[#AFC7D1] px-4">
          <i className="fa-solid fa-magnifying-glass text-[1.35rem] text-[#5A7A88]" aria-hidden />
          <input
            type="text"
            placeholder={`Search ${typeFilter === "blog" ? "blogs" : "projects"}`}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className="ml-3 w-full bg-transparent text-[1.6rem] italic text-[#5B6E78] outline-none placeholder:text-[#5B6E78]"
          />
        </div>

        <div className="mt-7 flex justify-end">
          <label className="flex items-center gap-2 text-[0.95rem] text-[#2B3D45]">
            <span>Filter by:</span>
            <select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value as ContentFilter);
                setCurrentPage(1);
                setSearchTerm("");
              }}
              className="rounded-md bg-[#AFC7D1] px-3 py-1.5 text-[#1f1f1f] outline-none"
            >
              <option value="blog">Blog</option>
              <option value="project">Project</option>
            </select>
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-[#f5d6d6] px-4 py-3 text-[1rem] text-[#5c1f1f]">{error}</p>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <div className="grid min-w-[980px] grid-cols-[0.55fr_0.95fr_1.25fr_1.15fr_0.95fr_1fr_1fr] gap-[8px]">
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>No.</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>Type</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>Title</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>Slug</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>Date</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>Edit</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>Delete</div>

            {isLoading ? (
              <div className={`${CELL_CLASS} col-span-7 flex items-center justify-center text-center`}>
                Loading…
              </div>
            ) : null}

            {!isLoading &&
              visibleRows.map((row, index) => (
                <React.Fragment key={`${row.type}-${row.slug}`}>
                  <div className={`${CELL_CLASS} flex items-center justify-center`}>
                    {startIndex + index + 1}
                  </div>
                  <div className={`${CELL_CLASS} flex items-center justify-center`}>{row.type}</div>
                  <div className={`${CELL_CLASS} flex items-center`}>{row.title}</div>
                  <div className={`${CELL_CLASS} flex items-center`}>{row.slug}</div>
                  <div className={`${CELL_CLASS} flex items-center`}>{row.date}</div>
                  <div className={`${CELL_CLASS} flex items-center justify-center`}>
                    {row.type ? (
                      <Link
                        href={`/admin/editor?mode=edit&type=${row.type}&slug=${encodeURIComponent(row.slug)}`}
                        aria-label={`Edit ${row.type} item`}
                        className="inline-flex h-9 min-w-[86px] items-center justify-center rounded-xl bg-[#D95A76] text-[1.2rem] text-white transition hover:opacity-90"
                      >
                        <i className="fa-solid fa-chevron-right" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                  <div className={`${CELL_CLASS} flex items-center justify-center`}>
                    {row.type ? (
                      <button
                        type="button"
                        aria-label={`Delete ${row.type} item`}
                        onClick={() => {
                          setDeleteError("");
                          setDeleteTarget({
                            type: row.type,
                            slug: row.slug,
                            title: row.title,
                          });
                        }}
                        className="h-9 min-w-[86px] rounded-xl bg-[#D95A76] text-[1rem] text-white transition hover:opacity-90"
                      >
                        <i className="fa-regular fa-trash-can" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </React.Fragment>
              ))}
            {!isLoading && visibleRows.length === 0 ? (
              <div className={`${CELL_CLASS} col-span-7 flex items-center justify-center text-center`}>
                No matching content found.
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-[#111111]">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1 || isLoading}
            className="text-[1.8rem] transition disabled:opacity-35"
            aria-label="First page"
          >
            <i className="fa-solid fa-angles-left" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="text-[1.45rem] transition disabled:opacity-35"
            aria-label="Previous page"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              disabled={isLoading}
              className={`h-12 min-w-[56px] rounded-2xl text-[1.35rem] text-[#111111] transition ${
                currentPage === page ? "bg-[#E5A999]" : "bg-[#F0C1B5]"
              } disabled:opacity-35`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(page + 1, pageCount))}
            disabled={currentPage === pageCount || isLoading}
            className="text-[1.45rem] transition disabled:opacity-35"
            aria-label="Next page"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(pageCount)}
            disabled={currentPage === pageCount || isLoading}
            className="text-[1.8rem] transition disabled:opacity-35"
            aria-label="Last page"
          >
            <i className="fa-solid fa-angles-right" />
          </button>
        </div>
      </div>

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onClick={closeDeleteModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-work-content-title"
            className="w-full max-w-[380px] rounded-2xl border border-[#c5d5dc] bg-white p-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-work-content-title" className="text-[1.15rem] font-semibold text-[#111111]">
              Delete {deleteTarget.type}?
            </h2>
            <p className="mt-3 text-[0.95rem] leading-snug text-[#3d4f57]">
              Remove <span className="font-medium text-[#1f1f1f]">{deleteTarget.title}</span> permanently?
              This cannot be undone.
            </p>
            {deleteError ? (
              <p className="mt-3 rounded-lg bg-[#f5d6d6] px-3 py-2 text-[0.9rem] text-[#5c1f1f]">
                {deleteError}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="h-10 min-w-[88px] rounded-xl border border-[#8a9aa2] px-4 text-[0.95rem] font-medium text-[#2B3D45] transition hover:bg-[#f0f4f6] disabled:opacity-45"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={isDeleting}
                className="h-10 min-w-[88px] rounded-xl bg-[#D95A76] px-4 text-[0.95rem] font-medium text-white transition hover:opacity-90 disabled:opacity-45"
              >
                {isDeleting ? "Deleting…" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
