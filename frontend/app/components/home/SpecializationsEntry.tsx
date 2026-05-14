import React from "react";

export type SpecializationBulletVariant = "pink" | "teal";

export interface SpecializationsEntryProps {
  label: string;
  bulletVariant: SpecializationBulletVariant;
}

const bulletColors: Record<SpecializationBulletVariant, string> = {
  pink: "bg-[#D65A78]",
  teal: "bg-[#438CAB]",
};

const SpecializationsEntry: React.FC<SpecializationsEntryProps> = ({
  label,
  bulletVariant,
}) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#9aa0a6] bg-white px-6 py-3 sm:px-8">
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${bulletColors[bulletVariant]}`}
        aria-hidden
      />
      <p className="px-4 text-center text-base text-[#4b5563] sm:text-lg">
        {label}
      </p>
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${bulletColors[bulletVariant]}`}
        aria-hidden
      />
    </div>
  );
};

export default SpecializationsEntry;
