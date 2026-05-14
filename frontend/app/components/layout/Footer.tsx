"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();


const Footer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const HandleSubmit = async (e: React.FormEvent<HTMLFormElement>)=> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const subdata = {
      email: formData.get('email'),
      name: formData.get('name')
    };

    setIsSubmitting(true);
    setSubmitState("idle");
    setFeedbackMessage("");

    try {
      const response = await fetch(`${FASTAPI_ROUTE_BASE}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subdata)
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      setSubmitState("success");
      setFeedbackMessage(data.details ?? "Subscription successful.");
      form.reset();
    } catch (error) {
      setSubmitState("error");
      setFeedbackMessage("Subscription failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <footer className="bg-[#478BA2] px-4 sm:px-8 py-8">
    <div className="max-w-5xl mx-auto text-white py-8 flex flex-col sm:flex-row justify-between gap-4 space-y-8 sm:space-y-0">

      <div id="subscription-form" className="flex flex-col text-left justify-end">
        <h1 className='text-lg font-bold mb-4'>Subscribe</h1>
        <p className='mb-4'>Stay updated with my latest articles</p>
        <div>
          <form 
            onSubmit={HandleSubmit}
          >
            <div className='flex flex-col text-[#333333]'>
              <input 
              type="email" 
              name="email"
              placeholder="Enter your email" 
              className="mb-4 py-2 px-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DE5B6F] focus:border-transparent"
              required
              />
              <input 
              type="text" 
              name="name"
              placeholder="Enter your name" 
              className="mb-4 py-2 px-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DE5B6F] focus:border-transparent"
              required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className='bg-[#DE5B6F] text-white py-2 px-4 rounded hover:opacity-70 disabled:opacity-60'
            >
              {isSubmitting ? "Submitting..." : "Subscribe"}
            </button>
            {submitState !== "idle" && (
              <p
                className={`mt-3 text-sm ${
                  submitState === "success" ? "text-[#D5F5E3]" : "text-[#FFE3E8]"
                }`}
                role="status"
              >
                {feedbackMessage}
              </p>
            )}
          </form>
        </div> 
      </div>

      <div className="flex flex-col text-left sm:text-right">
        {/* <p>Ayotomiwa Salau</p> */}
        <p className="mb-4 text-xl font-bold text-white">
          Ayotomiwa Salau 
        </p>
        <p className="mb-4 text-sm">&copy;2025 All rights reserved</p>

        {/* Social links (external) */}
        <div className="flex flex-row justify-start sm:justify-end mb-4 space-x-4">
          <Link
            href="https://github.com/ayotomiwasalau"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70"
          >
            <span className="text-3xl">
                <i className="fa-brands fa-github"></i>
            </span>
          </Link>

          <Link
            href="https://www.linkedin.com/in/ayotomiwa-salau"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70"
          >
            <span className="text-3xl">
              <i className="fa-brands fa-linkedin"></i>
            </span>
          </Link>
          <Link
            href="https://ayotomiwasalau.medium.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70"
          >
            <span className="text-3xl">
                <i className="fa-brands fa-medium"></i>
            </span>
          </Link>
          <Link
            href="https://x.com/ayotomiwasalau"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70"
          >
            <span className="text-3xl">
                <i className="fa-brands fa-x-twitter"></i>
            </span>
          </Link>
          <Link
            href="https://www.youtube.com/@ayotomiwasalau"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70"
          >
            <span className="text-3xl">
                <i className="fa-brands fa-youtube"></i>
            </span>
          </Link>
          <Link
            href="https://www.instagram.com/ayotomiwasalau"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70"
          >
            <span className="text-3xl">
                <i className="fa-brands fa-instagram"></i>
            </span>
          </Link>
          <Link
            href="https://www.tiktok.com/@ayotomiwasalau"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-70"
          >
            <span className="text-3xl">
                <i className="fa-brands fa-tiktok"></i>
            </span>
          </Link>
        </div>

        {/* Legal links (internal) */}
        <div className="space-x-4">
          <Link href="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
  
    </div>
    </footer>
  );
};

export default Footer;
