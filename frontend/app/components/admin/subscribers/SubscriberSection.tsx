"use client";

import React, { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@lib/adminFetch";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";

interface SubscriberRow {
  id: string;
  username: string;
  email: string;
  state: "subscribed" | "unsubscribed";
  dateJoined: string;
}

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

const CELL_CLASS = "min-h-[56px] bg-[#B8CFD8] px-3 py-2 text-[1rem] text-[#1f1f1f]";
const ROWS_PER_PAGE = 7;

interface ApiSubscriber {
  id: string;
  name: string;
  email: string;
  created_on: string;
}

interface SubscriberListResponse {
  subscribers: ApiSubscriber[];
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
}

export default function SubscriberSection() {
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [listReloadKey, setListReloadKey] = useState(0);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetUsername, setDeleteTargetUsername] = useState("");
  const [deleteTargetEmail, setDeleteTargetEmail] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSubscribers() {
      setIsLoading(true);
      try {
        const response = await adminFetch(`${FASTAPI_ROUTE_BASE}/subscribers?per_page=100`);

        if (!response.ok) {
          throw new Error("Unable to load subscribers.");
        }

        const data = (await response.json()) as SubscriberListResponse;
        if (!isMounted) return;

        setSubscribers(
          data.subscribers.map((subscriber) => ({
            id: subscriber.id,
            username: subscriber.name,
            email: subscriber.email,
            state: "subscribed",
            dateJoined: formatDate(subscriber.created_on),
          })),
        );
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load subscribers.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadSubscribers();

    return () => {
      isMounted = false;
    };
  }, [listReloadKey]);

  useEffect(() => {
    if (!deleteTargetId) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isDeleting) return;
        setDeleteTargetId(null);
        setDeleteError("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteTargetId, isDeleting]);

  function closeDeleteModal() {
    if (isDeleting) return;
    setDeleteTargetId(null);
    setDeleteError("");
  }

  async function confirmDeleteSubscriber() {
    if (!deleteTargetId) return;
    setDeleteError("");
    setIsDeleting(true);
    try {
      const url = `${FASTAPI_ROUTE_BASE}/subscribers/${encodeURIComponent(deleteTargetId)}`;
      const response = await adminFetch(url, { method: "DELETE" });

      if (!response.ok) {
        let message = "Unable to delete subscriber.";
        try {
          const body = (await response.json()) as { detail?: unknown };
          if (typeof body.detail === "string") message = body.detail;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      setDeleteTargetId(null);
      setListReloadKey((k) => k + 1);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  }

  const totalActiveSubs = useMemo(
    () => subscribers.filter((s) => s.state === "subscribed").length,
    [subscribers],
  );

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredRows = subscribers.filter((row) =>
    `${row.username} ${row.email} ${row.state} ${row.dateJoined}`.toLowerCase().includes(normalizedSearchTerm),
  );

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE));
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const visibleRows = filteredRows.slice(startIndex, startIndex + ROWS_PER_PAGE);

  return (
    <section className="w-full bg-white px-6 py-12 sm:px-10">
      <div className="mx-auto w-full max-w-[900px]">
        <h1 className="text-[2rem] font-semibold text-[#111111]">Subscribers</h1>

        <p className="mt-3 text-[1rem] font-bold italic text-[#2B3F4F]">
          Total active subs: {totalActiveSubs}
        </p>

        <div className="mt-8 flex h-12 w-full items-center rounded-lg bg-[#AFC7D1] px-4">
          <i className="fa-solid fa-magnifying-glass text-[1.35rem] text-[#5A7A88]" aria-hidden />
          <input
            type="text"
            placeholder="Search email"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            className="ml-3 w-full bg-transparent text-[1.6rem] italic text-[#5B6E78] outline-none placeholder:text-[#5B6E78]"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="grid min-w-[920px] grid-cols-[0.55fr_1fr_1.35fr_0.95fr_1fr_1fr] gap-[8px]">
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>No.</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>Username</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>Email</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>State</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>Date joined</div>
            <div className={`${CELL_CLASS} text-center text-[1.15rem] font-semibold`}>Delete</div>

            {isLoading ? (
              <div className={`${CELL_CLASS} col-span-6 flex items-center justify-center text-center`}>
                Loading subscribers...
              </div>
            ) : null}
            {error ? (
              <div className={`${CELL_CLASS} col-span-6 flex items-center justify-center text-center text-[#8A2438]`}>
                {error}
              </div>
            ) : null}
            {visibleRows.map((row, index) => (
              <React.Fragment key={row.id}>
                <div className={`${CELL_CLASS} flex items-center justify-center`}>
                  {startIndex + index + 1}
                </div>
                <div className={`${CELL_CLASS} flex items-center justify-center`}>{row.username}</div>
                <div className={`${CELL_CLASS} flex items-center`}>{row.email}</div>
                <div className={`${CELL_CLASS} flex items-center justify-center`}>{row.state}</div>
                <div className={`${CELL_CLASS} flex items-center`}>{row.dateJoined}</div>
                <div className={`${CELL_CLASS} flex items-center justify-center`}>
                  <button
                    type="button"
                    aria-label={`Delete subscriber ${row.email}`}
                    onClick={() => {
                      setDeleteError("");
                      setDeleteTargetId(row.id);
                      setDeleteTargetUsername(row.username);
                      setDeleteTargetEmail(row.email);
                    }}
                    className="h-9 min-w-[86px] rounded-xl bg-[#D95A76] text-[1rem] text-white transition hover:opacity-90"
                  >
                    <i className="fa-regular fa-trash-can" aria-hidden />
                  </button>
                </div>
              </React.Fragment>
            ))}
            {!isLoading && !error && visibleRows.length === 0 ? (
              <div className={`${CELL_CLASS} col-span-6 flex items-center justify-center text-center`}>
                No subscribers match your search.
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-[#111111]">
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
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
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

      {deleteTargetId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onClick={closeDeleteModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-subscriber-title"
            className="w-full max-w-[380px] rounded-2xl border border-[#c5d5dc] bg-white p-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-subscriber-title" className="text-[1.15rem] font-semibold text-[#111111]">
              Remove subscriber?
            </h2>
            <p className="mt-3 text-[0.95rem] leading-snug text-[#3d4f57]">
              Delete{" "}
              <span className="font-medium text-[#1f1f1f]">
                {deleteTargetUsername || deleteTargetEmail}
              </span>{" "}
              (<span className="break-all font-medium text-[#1f1f1f]">{deleteTargetEmail}</span>)?
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
                onClick={() => void confirmDeleteSubscriber()}
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
