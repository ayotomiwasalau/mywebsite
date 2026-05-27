import Image from "next/image";
import React from "react";

export interface AboutStackItem {
  name: string;
  logoSrc: string;
}

interface AboutStackComponentProps {
  item: AboutStackItem;
}

const AboutStackComponent: React.FC<AboutStackComponentProps> = ({ item }) => {
  return (
    <div className="flex w-[4.5rem] flex-col items-center gap-1.5 sm:w-[5.25rem] sm:gap-2 md:w-24 lg:w-[6.5rem]">
      <div className="relative aspect-square w-full max-w-[2.75rem] sm:max-w-[3.5rem] md:max-w-[4rem] lg:max-w-[4.5rem]">
        <Image
          src={item.logoSrc}
          alt={item.name}
          fill
          className="object-contain"
          sizes="(max-width: 640px) 44px, (max-width: 1024px) 64px, 72px"
        />
      </div>
      <span className="max-w-[6.5rem] text-center text-[10px] font-normal leading-tight text-[#333333] sm:max-w-none sm:text-xs md:text-sm">
        {item.name}
      </span>
    </div>
  );
};

export default AboutStackComponent;
