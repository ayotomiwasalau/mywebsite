import Link from "next/link";

const PersonalEdgeSection = () => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold uppercase tracking-wide text-black md:text-2xl lg:text-3xl">
        Personal Edge
      </h2>
      <p className="mb-3 mt-2 max-w-3xl text-sm leading-normal text-[#666666] md:text-base">
        The engineer behind the pipelines — and the person off the court.
      </p>

      <h3 className="text-lg font-semibold text-[#333333]">How I work</h3>
      <p className="mt-1 max-w-3xl text-[#333333] leading-normal">
        I&apos;m an engineer who owns systems end to end, I take ideas to
        production, from design and data modelling, batch and streaming
        pipelines, observability, analytics and AI/ML. I care about reliability
        and cost as much as delivery speed — and I work closely with product
        and data science so what ships actually gets used.
      </p>

      <h3 className="mt-4 text-lg font-semibold text-[#333333]">Beyond work</h3>
      <div className="mt-1 flex max-w-3xl flex-col gap-2 text-[#333333] leading-normal">
        <p>
          <span className="font-semibold">On the court &amp; the couch</span>
          {" "}— basketball pick-up games and videogames when I need a hard reset
          from the terminal.
        </p>
        <p>
          <span className="font-semibold">Building in public</span>
          {" "}— vibecoded games at{" "}
          <Link href="/games" className="text-black-600 underline hover:text-blue-800">
            /games
          </Link>
          ; blogs and project notes at{" "}
          <Link href="/work" className="text-black-600 underline hover:text-blue-800">
            /work
          </Link>
          ; always picking up new platform and ML tools (Udacity and side
          experiments).
        </p>
        <p>
          <span className="font-semibold">Consulting</span>
          {" "}— I also take on cloud data and platform projects through{" "}
          <Link
            href="https://tiptier.co"
            className="text-black-600 underline hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tiptier
          </Link>
          .
        </p>
      </div>
    </section>
  );
};

export default PersonalEdgeSection;
