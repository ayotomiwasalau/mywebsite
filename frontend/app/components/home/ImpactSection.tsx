import React from "react";
import ImpactComponent from "./ImpactComponent";

const IMPACT_ITEMS: { text: string; variant: "blue" | "salmon" }[] = [
  { text: "8+ years big data experience", variant: "blue" },
  { text: "Process 10 trillions row of data", variant: "salmon" },
  { text: "Serve analytics to 5000+ users", variant: "blue" },
  { text: "10M tokens used", variant: "salmon" },
  { text: "99% Pipeline Uptime", variant: "blue" },
  { text: "12mins MTTR (Mean time to recovery)", variant: "salmon" },
];

export default function ImpactSection() {
  return (
    <section className="w-full bg-[#efefef] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-2xl font-light text-[#333333]">Impact</h2>

        <div className="mx-auto grid w-full max-w-full grid-cols-2 gap-3 sm:gap-4 md:max-w-none md:grid-cols-3 lg:max-w-[43rem] lg:gap-2 xl:max-w-[46rem] xl:gap-2.5">
          {IMPACT_ITEMS.map((item) => (
            <ImpactComponent
              key={item.text}
              text={item.text}
              variant={item.variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
