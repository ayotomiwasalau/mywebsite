import React, { useState } from 'react';
import {ClipboardIcon} from  '@heroicons/react/24/solid';

export default function EmailMe() {
    const [copied, setCopied] = useState(false);
  const email = "ayotomiwasalau@gmail.com";


  const handleCopy = () => {
    // Safety check for SSR or older browsers
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(email)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1000);
        })
        .catch((error) => {
          console.error('Error copying to clipboard:', error);
        });
    } else {
      // Fallback: copy using older execCommand API or inform user not supported
      fallbackCopy(email);
    }
  };

  // Fallback using execCommand (older approach)
  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; 
    textArea.style.left = "-9999px"; 
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className='md:mb-auto'>
    <div className="flex justify-between items-center text-[0.96rem] sm:text-base bg-white p-2 rounded max-w-[22rem]">
      <span className="text-[#333333] mr-2">{email}</span>
      <button
        onClick={handleCopy}
        className="text-gray-500 hover:text-gray-700 focus:outline-none flex flex-row"
        aria-label="Copy email address"
      >
        <ClipboardIcon className="h-5 w-5" />
        <p>copy</p>
      </button>
    </div>
    {copied && (
        <div className='flex justify-end max-w-[22rem]'>
        <div className="mt-1 p-1 bg-white rounded w-[4rem] ">
          <p className="text-xs text-green-600">Copied!</p>
        </div>
        </div>
      )}
    </div>
  );
}
