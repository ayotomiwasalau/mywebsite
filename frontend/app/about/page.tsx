import React from 'react'
import NavBar from '../components/layout/NavBar'
import Footer from '../components/layout/Footer'
import WhatIdoSection from '../components/about/WhatIdoSection'
import CertificationSection from '../components/about/CertificationSection'
import AboutStackSection from '../components/about/AboutStackSection'
import ExperienceSection from '../components/about/ExperienceSection'
import AboutHeroSection from '../components/about/AboutHeroSection'
import PersonalEdgeSection from '../components/about/PersonalEdgeSection'
import FooterCTA from '../components/layout/FooterCTA'

const About = () => {
  return (
    <div>
        <NavBar/>
        <AboutHeroSection />
        <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-14 ">

                <WhatIdoSection />

                <ExperienceSection />

                <CertificationSection />

                <AboutStackSection />

                <PersonalEdgeSection />

                <FooterCTA />
            </div>
            </div>

        <Footer/>
    </div>
  )
}

export default About
