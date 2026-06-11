import Image from "next/image";

const AboutHeroSection = () => {
  return (
    <div className="relative h-auto bg-gradient-to-r from-[#BBD5DC] to-[#F3A593]">
      <div className="flex items-center flex-col md:flex-row max-w-5xl space-y-8 md:space-x-16 mx-auto px-4 sm:px-8 py-14 pb-[7rem]">
        <div>
          <Image
            src="/profile.jpeg"
            alt="Ayotomiwa Salau"
            width={288}
            height={288}
            className="max-w-[18rem] max-h-[18rem] md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full"
            priority
          />
        </div>

        <div className="flex max-w-xl flex-col gap-4 md:gap-5">
          <p className="font-bold text-lg leading-normal text-[#333333] md:text-xl">
            Senior Data Engineer. Building platforms at scale.
          </p>
          <p className="font-light text-lg leading-normal text-[#333333] md:text-xl">
            Hello, I&apos;m Tomiwa, I have 8+ years experience owning data infrastructures and AI automations end to end for enterprise SaaS,
            from architecture to observability across domains such as credit, payment, insurance, edtech and professional services.
            I care about what is simple, what ships on time and what survives in production.
            At core for me, its about value to users and stakeholders.
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none transform rotate-180">
        <svg
          className="relative block w-[calc(142%+1.3px)] h-[150px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white"
          />
        </svg>
      </div>
    </div>
  );
};

export default AboutHeroSection;
