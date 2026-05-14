import Image from "next/image";
import React from "react";

export type WhatIdoVariant = "blue" | "salmon";

export interface WhatIdoItem {
  title: string;
  description: string;
  iconSrc: string;
  variant: WhatIdoVariant;
}

interface WhatIdoComponentProps {
  item: WhatIdoItem;
}

const backgrounds: Record<WhatIdoVariant, string> = {
  blue: "bg-[#BBD5DC]",
  salmon: "bg-[#E6A892]",
};

const WhatIdoComponent: React.FC<WhatIdoComponentProps> = ({ item }) => {
  return (
    <article
      className={`flex h-full flex-col items-center rounded-2xl px-5 py-8 text-center ${backgrounds[item.variant]}`}
    >
      <div className="relative mb-5 h-16 w-16 shrink-0 md:h-[4.5rem] md:w-[4.5rem]">
        <Image
          src={item.iconSrc}
          alt={item.title}
          fill
          className="object-contain"
          sizes="64px"
        />
      </div>
      <h3 className="mb-3 text-base font-bold leading-snug text-[#333333] md:text-lg">
        {item.title}
      </h3>
      <p className="text-sm font-normal leading-relaxed text-[#333333] md:text-base">
        {item.description}
      </p>
    </article>
  );
};

export default WhatIdoComponent;
