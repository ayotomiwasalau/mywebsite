import React from "react";

interface BoardCardProps {
  label: string;
  value: number;
}

const BoardCard: React.FC<BoardCardProps> = ({ label, value }) => {
  return (
    <article className="flex min-h-[112px] w-full max-w-[210px] flex-col items-center justify-center rounded-2xl bg-[#E8A193] px-2 py-3 text-center text-[#1f1f1f] sm:min-h-[132px] sm:px-4 sm:py-4 md:min-h-[150px]">
      <p className="text-[0.85rem] leading-snug sm:text-[1rem] md:text-[1.2rem]">{label}</p>
      <p className="mt-0.5 text-[1.65rem] font-bold leading-none sm:mt-1 sm:text-[2rem] md:text-[2.35rem]">
        {value}
      </p>
    </article>
  );
};

export default BoardCard;
