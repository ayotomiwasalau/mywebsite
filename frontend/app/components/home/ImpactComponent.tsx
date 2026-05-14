import React from "react";

export type ImpactCardVariant = "blue" | "salmon";

export interface ImpactComponentProps {
  text: string;
  variant: ImpactCardVariant;
}

const backgrounds: Record<ImpactCardVariant, string> = {
  blue: "bg-[#BBD5DC]",
  salmon: "bg-[#E6A892]",
};

const ImpactComponent: React.FC<ImpactComponentProps> = ({ text, variant }) => {
  return (
    <div
      className={`flex aspect-square min-h-[10rem] w-full max-w-full items-center justify-center rounded-2xl px-4 py-6 text-center sm:min-h-[11rem] lg:mx-auto lg:min-h-0 lg:max-w-[14rem] lg:px-4 lg:py-5 xl:max-w-[15rem] ${backgrounds[variant]}`}
    >
      <p className="text-lg font-semibold leading-snug text-[#243344] sm:text-xl lg:text-xl xl:text-2xl">
        {text}
      </p>
    </div>
  );
};

export default ImpactComponent;
