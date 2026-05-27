"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@lib/adminFetch";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";
import MessageComponent, { MessageRow } from "./MessageComponent";

const MESSAGE_BATCH_SIZE = 5;
const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

interface ApiMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_on: string;
}

interface MessageListResponse {
  messages: ApiMessage[];
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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
}

const MessageSection = () => {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MessageRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [visibleCount, setVisibleCount] = useState(MESSAGE_BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const visibleMessages = messages.slice(0, visibleCount);
  const hasMoreMessages = visibleCount < messages.length;

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      try {
        const response = await adminFetch(`${FASTAPI_ROUTE_BASE}/messages?per_page=100`);

        if (!response.ok) {
          throw new Error("Unable to load messages.");
        }

        const data = (await response.json()) as MessageListResponse;
        if (!isMounted) return;

        setMessages(
          data.messages.map((message) => ({
            id: message.id,
            name: message.name,
            email: message.email,
            date: formatDate(message.created_on),
            subject: message.subject,
            message: message.message,
          })),
        );
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to load messages.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadMessages();

    return () => {
      isMounted = false;
    };
  }, []);

  async function confirmDeleteMessage() {
    if (!pendingDelete) return;
    setDeleteError("");
    setDeleteBusy(true);
    try {
      const path = `${FASTAPI_ROUTE_BASE}/messages/${encodeURIComponent(pendingDelete.id)}`;
      const response = await adminFetch(path, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await extractApiErrorMessage(response));
      }
      const removedId = pendingDelete.id;
      setMessages((prev) => prev.filter((m) => m.id !== removedId));
      setSelectedMessage((current) =>
        current?.id === removedId ? null : current,
      );
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[1.5rem] font-bold text-[#111111] sm:text-[1.75rem]">New messages</h3>
        <div className="flex items-center gap-3">
          <span className="text-[1rem] text-[#444444]">Sort:</span>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md bg-[#4A8EA6] px-4 py-1.5 text-[1rem] text-white"
          >
            <span>Latest</span>
            <i className="fa-solid fa-chevron-down text-xs" aria-hidden />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-[0.95rem] italic text-[#555555]">Loading messages...</p>
        ) : null}
        {error ? (
          <p className="text-[0.95rem] italic text-[#8A2438]">{error}</p>
        ) : null}
        {!isLoading && !error && visibleMessages.length === 0 ? (
          <p className="text-[0.95rem] italic text-[#555555]">No messages yet.</p>
        ) : null}
        {visibleMessages.map((row) => (
          <MessageComponent
            key={row.id}
            row={row}
            onMoreClick={setSelectedMessage}
            onDeleteClick={setPendingDelete}
          />
        ))}
      </div>

      {hasMoreMessages ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + MESSAGE_BATCH_SIZE, messages.length),
              )
            }
            className="text-[1.25rem] text-[#333333]"
          >
            See 5 more <i className="fa-solid fa-chevron-down text-sm" />
          </button>
        </div>
      ) : null}

      {pendingDelete ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-message-title"
        >
          <div className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl">
            <h4
              id="delete-message-title"
              className="text-[1.35rem] font-bold text-[#111111]"
            >
              Delete this message?
            </h4>
            <p className="mt-3 text-[1rem] leading-relaxed text-[#444444]">
              This removes the message from your inbox permanently. You cannot undo this action.
            </p>
            {pendingDelete ? (
              <p className="mt-3 rounded-lg bg-[#F2F2F2] px-3 py-2 text-[0.95rem] text-[#333333]">
                <span className="font-semibold">{pendingDelete.name}</span>
                {pendingDelete.subject.trim() ? (
                  <>
                    {" "}
                    — <span className="italic">{pendingDelete.subject}</span>
                  </>
                ) : null}
              </p>
            ) : null}
            {deleteError ? (
              <p className="mt-3 text-[0.95rem] text-[#8A2438]" role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => {
                  setPendingDelete(null);
                  setDeleteError("");
                }}
                className="rounded-xl border border-[#cccccc] bg-white px-5 py-2 text-[1rem] text-[#333333] transition hover:bg-[#f5f5f5] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => void confirmDeleteMessage()}
                className="rounded-xl bg-[#C94C62] px-5 py-2 text-[1rem] font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {deleteBusy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-[620px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h4 className="text-[1.6rem] font-bold text-[#111111]">Message details</h4>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-[1.4rem] leading-none text-[#666666] transition hover:text-[#111111]"
                aria-label="Close message details"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-[1rem] text-[#2f2f2f]">
              <p>
                <span className="font-semibold">Name:</span> {selectedMessage.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {selectedMessage.email}
              </p>
              <p>
                <span className="font-semibold">Date:</span> {selectedMessage.date}
              </p>
              <p>
                <span className="font-semibold">Subject:</span> {selectedMessage.subject}
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-[#F2F2F2] p-4">
              <p className="text-[0.95rem] font-semibold text-[#444444]">Full message</p>
              <p className="mt-2 text-[1rem] leading-relaxed text-[#333333]">
                {selectedMessage.message}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default MessageSection;
