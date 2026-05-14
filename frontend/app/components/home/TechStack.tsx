import Image from "next/image";
import React from "react";

export interface TechStackItem {
  name: string;
  logoSrc: string;
}

interface TechStackProps {
  item: TechStackItem;
}

const TechStack: React.FC<TechStackProps> = ({ item }) => {
  return (
    <div className="flex w-full max-w-[3.75rem] flex-col items-center gap-1.5 sm:max-w-[5.25rem] sm:gap-2 md:w-24 md:max-w-none lg:w-[6.5rem] xl:w-28">
      <div className="relative aspect-square w-full max-w-[2.75rem] sm:max-w-[3.75rem] md:max-w-[4.25rem] lg:max-w-[4.75rem] xl:max-w-[5.25rem]">
        <Image
          src={item.logoSrc}
          alt={item.name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 52px, (max-width: 1024px) 68px, 84px"
        />
      </div>
      <span className="text-center text-[10px] font-medium leading-tight text-[#333333] sm:text-xs md:text-sm lg:text-base">
        {item.name}
      </span>
    </div>
  );
};

export default TechStack;
