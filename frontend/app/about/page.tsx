import React from 'react'
import NavBar from '../components/layout/NavBar'
import Footer from '../components/layout/Footer'
import WhatIdoSection from '../components/about/WhatIdoSection'
import CertificationSection from '../components/about/CertificationSection'
import AboutStackSection from '../components/about/AboutStackSection'
import ExperienceSection from '../components/about/ExperienceSection'
import Image from 'next/image'
import Link from 'next/link'
import FooterCTA from '../components/layout/FooterCTA'

const About = () => {
  return (
    <div>
        <NavBar/>
        <div className='relative h-auto bg-gradient-to-r from-[#BBD5DC] to-[#F3A593]'>
            <div className="flex items-center flex-col md:flex-row max-w-5xl space-y-8 md:space-x-16 mx-auto px-4 sm:px-8 py-14 pb-[7rem]">
            <Image
                src="/profile.jpeg"
                alt="Ayotomiwa Salau"
                width={288}
                height={288}
                className="max-w-[18rem] max-h-[18rem] md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full"
            />

            <div className="flex max-w-xl flex-col gap-4 md:gap-5">
              <p className="font-bold text-lg leading-normal text-[#333333] md:text-xl">
              Senior Data Engineer. 
              Building platforms at scale for production data pipelines, analytics, streaming, warehousing, and applied AI & ML.
              {/* Design, build, and deploy cloud-based 
              data and intelligence platforms. */}
              </p>
              <p className="font-light text-lg leading-normal text-[#333333] md:text-xl">
              Hello, I'm Tomiwa, 8+ years experience owning systems end to end, from architecture to observability.
              I care as much about what survives in production and what ships on time.
              For me, its about value to users and stakeholders.
              </p>
            </div>
            
            </div>

            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none transform rotate-180">
            <svg className='relative block w-[calc(142%+1.3px)] h-[150px]' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
            </svg>
            </div>
        </div>
        <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-14 ">

                <WhatIdoSection />

                <ExperienceSection />

                <CertificationSection />

                <AboutStackSection />

                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-[#333333]">Personal Edge</h2>
                    <p className="mb-3 mt-2 max-w-3xl text-sm leading-normal text-[#666666] md:text-base">
                    The engineer behind the pipelines — and the person off the court.
                    </p>

                    <h3 className="text-lg font-semibold text-[#333333]">How I work</h3>
                    <p className="mt-1 max-w-3xl text-[#333333] leading-normal">
                    I&apos;m an engineer who owns systems end to end, I take ideas to production, from design and data modelling,
                    batch and streaming pipelines, observability, analytics and AI/ML.
                    I care about reliability and cost as much as delivery speed — and I work closely with
                    product and data science so what ships actually gets used.
                    </p>

                    <h3 className="mt-4 text-lg font-semibold text-[#333333]">Beyond work</h3>
                    <div className="mt-1 flex max-w-3xl flex-col gap-2 text-[#333333] leading-normal">
                      <p>
                        <span className="font-semibold">On the court &amp; the couch</span>
                        {" "}— basketball pick-up games and videogames when I need a hard reset from the terminal.
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
                        ; always picking up new platform and ML tools (Udacity and side experiments).
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

                <FooterCTA />
            </div>
            </div>

        <Footer/>
    </div>
  )
}

export default About