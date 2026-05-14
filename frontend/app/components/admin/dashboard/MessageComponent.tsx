import React from "react";

export interface MessageRow {
  id: string;
  name: string;
  email: string;
  date: string;
  subject: string;
  message: string;
}

interface MessageComponentProps {
  row: MessageRow;
  onMoreClick: (row: MessageRow) => void;
  onDeleteClick: (row: MessageRow) => void;
}

const MessageComponent: React.FC<MessageComponentProps> = ({
  row,
  onMoreClick,
  onDeleteClick,
}) => {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-3 w-3 rounded-full bg-[#d5d5d5]" aria-hidden />
      <article className="w-full rounded-2xl border border-[#9b9b9b] px-4 py-3 text-[#333333]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[1.45rem] font-bold leading-tight">{row.name}</p>
            <p className="text-[1rem] text-[#4f4f4f]">{row.email}</p>
          </div>
          <p className="pt-1 text-[0.95rem] text-[#666666]">{row.date}</p>
        </div>
        <p className="mt-2 text-[1rem] leading-snug text-[#444444]">
          {row.subject.trim() || "—"}
        </p>
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => onDeleteClick(row)}
            className="rounded-md border border-[#C94C62] bg-white px-3 py-1 text-[0.9rem] text-[#C94C62] transition hover:bg-[#FCE8EC]"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => onMoreClick(row)}
            className="rounded-md bg-[#4A8EA6] px-3 py-1 text-[0.9rem] text-white transition hover:opacity-90"
          >
            More
          </button>
        </div>
      </article>
    </div>
  );
};

export default MessageComponent;
