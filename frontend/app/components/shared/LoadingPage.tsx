"use client";
import React from 'react'
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";
import { RotatingLines } from "react-loader-spinner";

const LoadingPage = () => {
  return (
    <div>
      <NavBar/>
        <div className="flex justify-center items-center h-screen bg-white ">
          <RotatingLines
            strokeColor="grey"
            strokeWidth="5"
            animationDuration="0.75"
            width="96"
            visible={true}
          />
        </div>
        
        <Footer />
    </div>
    
  )
}

export default LoadingPage