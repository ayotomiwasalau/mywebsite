"use client"
import React from 'react';
import Share from '../posts/Share';
import { PostsSchema } from '../utils/interface';
import { getTimeDifference } from '../utils/tools';
import Link from 'next/link';

interface PostLandingProps {
    postSelected: PostsSchema;
}

const PostLanding = ({ postSelected }: PostLandingProps) => {
    const listHref = "/work";
    const typeLabel = postSelected.kind === "project" ? "project" : "blog";

    return (
        
        <div className='relative h-auto bg-gradient-to-r from-[#BBD5DC] to-[#F3A593]'>

            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 md:py-15 pb-[7rem]">

                <p className="mb-2 flex flex-wrap items-center gap-2 text-md text-[#333333]">
                    <Link href={listHref} className='underline hover:opacity-60'>Work</Link>
                    <span>&gt;&gt;</span>
                    <span className="inline-flex h-8 min-w-[78px] items-center justify-center rounded-[14px] bg-[#4A8EA6] px-3 text-md font-light lowercase leading-none text-white">
                        {typeLabel}
                    </span>
                    <span>&gt;&gt;</span>
                    <span>{postSelected.title}</span>
                </p>

                {/* Main title */}
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                    {postSelected.title}
                </h1>

                <div className="flex flex-wrap flex-col items-left gap-6 mb-6">
                    {/* Share post + icons */}
                        
                    <Share postSelected={postSelected}/>

                    {/* Author + date */}
                    <div className="flex items-left space-x-3">
                    <img
                        src="/profile.jpeg"
                        alt="Author"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col text-[#333333]">
                        <span className="font-large text-lg ">Ayotomiwa Salau</span>
                        <span suppressHydrationWarning className="">
                          {getTimeDifference(postSelected.timeAgo)}
                        </span>
                    </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {postSelected.tags.map(
                    (tag, index) => (
                        <span
                        key={index}
                        className="px-3 py-1 rounded-xl bg-[#DE5B6F] text-white text-sm"
                        >
                        {tag}
                        </span>
                    )
                    )}
                </div>

            </div>
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none transform rotate-180 pointer-events-none">
            <svg className='relative block w-[calc(142%+1.3px)] h-[150px]' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
            </svg>
            </div>
        </div>
  )
}

export default PostLanding;