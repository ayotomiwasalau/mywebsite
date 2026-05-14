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
    <div className='font-[family-name:var(--font-geist-mono)]'>
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

            <div className="flex max-w-xl flex-col gap-5 md:gap-6">
              <p className="font-bold text-lg leading-relaxed text-[#333333] md:text-xl">
                Senior Data Engineer. Design, build, and deploy cloud-based 
                intelligence platforms.
              </p>
              <p className="font-light text-lg leading-relaxed text-[#333333] md:text-xl">
                Hello there! I am Tomiwa. I have 8+ years of experience as a Data Engineer. I help businesses with ETL &
                data warehousing, cloud engineering, pipeline automations and Agentic
                workflows.
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
                    <p className="mb-2 mt-2 max-w-3xl text-sm leading-relaxed text-[#666666] md:text-base">
                    How I work across product, architecture, and delivery from idea to production.
                    </p>
                    <p className="text-[#333333] leading-relaxed">
                    I am an end-to-end person. I specialise in taking a product from an idea to a live solution. 
                    I enjoy working across all value chains from the design to the deployment of large-scale distributed systems. 
                    I work on databases, datawarehousing, APIs, batch/streaming pipelines, data modelling, analytics, machine learning, 
                    AI engineering, cloud deployments, infrastructure as Code (Iac), microservices, Kubernetes, UI development and some blockchain projects. 
                    {/* <Link href="https://tiptier.co" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Tiptier</Link>, 
                    we build cloud-based data and AI solutions for businesses and teams, and also provide technical consultations on projects.  */}
                    </p>
                </section>

                <FooterCTA />
            </div>
            </div>

        <Footer/>
    </div>
  )
}

export default About