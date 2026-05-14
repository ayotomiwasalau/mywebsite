"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { Bars3BottomRightIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/solid';
import EmailMe from './EmailMe';
import SocialIcon from "./SocialIcon";
import SocialIconLink from './SocialIconLink';

interface NavProps {
    navItem: string,
    link: string
}

const navObj:NavProps[] = [
    {navItem: 'HOME', link: '/'}, 
    {navItem: 'WORK', link: '/work'}, 
    {navItem: 'GAMES', link: '/games'}, 
    {navItem: 'ABOUT', link: '/about'},
    {navItem: 'CONTACT', link: '/contact'}
]

const NavBar = () => {

    const [isOpen, setOpen] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    

    const handleClick = () => setOpen(!isOpen);
    const closeMobileMenu = () => setOpen(false);

    const handleClickOutside = (event: MouseEvent) => {
        if (navRef.current && !navRef.current.contains(event.target as Node)) {
            closeMobileMenu();
        } 
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav ref={navRef} className="bg-[#478BA2] flex flex-col w-[80]">
            <div className="py-2 px-3 md:py-4 md:px-6 lg:px-12 flex justify-between">
                <div className="flex flex-col w-full items-center">
                    <div className="flex flex-row justify-between w-full">
                        <div className="flex flex-col py-2 h-full">
                            <Logo />
                            <div className="text-white text-md"> Big Data Engineer </div>
                            <div className="text-white text-md"> Building Data and AI Platforms </div>
                            <div className="md:hidden mt-2"><EmailMe/></div>
                        </div>

                        <div className="hidden md:flex md:flex-col md:py-2 md:h-full">
                            <div className="flex justify-end">
                                {/* GitHub */}
                                <SocialIcon href="https://github.com/ayotomiwasalau" label="GitHub" icon="fa-brands fa-github" iconColor="text-white"/>

                                    {/* LinkedIn */}
                                <SocialIcon href="https://www.linkedin.com/in/ayotomiwa-salau" label="LinkedIn" icon="fa-brands fa-linkedin-in" iconColor="text-white"/>

                                {/* YouTube */}
                                <SocialIcon href="https://www.youtube.com/@ayotomiwasalau" label="YouTube" icon="fa-brands fa-youtube" iconColor="text-white"/>

                                {/* X (Twitter) */}
                                <SocialIcon href="https://x.com/ayotomiwasalau" label="X" icon="fa-brands fa-x-twitter" iconColor="text-white"/>
                            </div>
                            <EmailMe/>
                        </div>                    
                    </div> 

                    <div className="hidden md:flex md:space-x-0 lg:space-x-16 underline mt-4">
                        {navObj.map((item, index) => (
                            <Link href={item.link} key={index} className="text-blueGray text-lg hover:underline px-6 py-2 rounded-2xl cursor-pointer">
                                {item.navItem}
                            </Link>
                        ))}
                    </div>

                </div>

                {/* mobile view */}
                <div className="md:hidden py-2">
                    <button onClick={handleClick} >
                        {isOpen ? (
                            <XMarkIcon className="w-[26px] h-[26px] text-blueGray font-bold md:hidden" />) 
                            : (<Bars3BottomRightIcon className="w-[26px] h-[26px] text-blueGray font-bold md:hidden" />)}
                    </button>
                </div>                
            </div>

            {isOpen && (
                <div className="md:hidden p-4 bg-white">
                    <div className="flex flex-col space-y-2 ">
                        
                            {navObj.map((item, index) => (
                                <Link href={item.link} key={index} className="text-[#333333]  hover:underline px-6 py-1 rounded-xl">
                                    {item.navItem}
                                </Link>                                
                            ))}

                            <div className="flex justify-start mt-4">
                                {/* GitHub */}
                                <SocialIcon href="https://github.com/ayotomiwasalau" label="GitHub" icon="fa-brands fa-github" iconColor="text-black"/>

                                    {/* LinkedIn */}
                                <SocialIcon href="https://www.linkedin.com/in/ayotomiwa-salau" label="LinkedIn" icon="fa-brands fa-linkedin-in" iconColor="text-black"/>

                                {/* YouTube */}
                                <SocialIcon href="https://www.youtube.com/@ayotomiwasalau" label="YouTube" icon="fa-brands fa-youtube" iconColor="text-black"/>

                                {/* X (Twitter) */}
                                <SocialIcon href="https://x.com/ayotomiwasalau" label="X" icon="fa-brands fa-x-twitter" iconColor="text-black"/>
                            </div>
                        
                    </div>
                </div>
            )}
        </nav>
    )
}

export default NavBar;
