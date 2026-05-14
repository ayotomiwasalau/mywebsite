import React from "react";

export interface FeatProjectTagsProps {
  tags: string[];
}

export function FeatProjectTags({ tags }: FeatProjectTagsProps) {
  return (
    <ul className="flex flex-wrap gap-2" role="list">
      {tags.map((tag) => (
        <li key={tag}>
          <span className="inline-block rounded-full bg-[#5E8EAB] px-3 py-1 text-xs font-medium lowercase text-white">
            {tag}
          </span>
        </li>
      ))}
    </ul>
  );
}
