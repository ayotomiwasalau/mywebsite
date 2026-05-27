import React from 'react'
import NavBar from '../layout/NavBar'
import Footer from '../layout/Footer'

const ErrorPage = () => {
  return (
    <div className='bg-white'>
        <NavBar/>
        <div className="flex items-center justify-center min-h-screen ">
            <h1 className="text-4xl font-bold text-[#333333]">This page does not exist</h1> 
        </div>
        <Footer />
    </div>
    
  )
}

export default ErrorPage