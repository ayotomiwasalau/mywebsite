import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

const Logo = () => {
  return (
    <Link href="/">
    <div className="flex items-center">
      {/* Replace '/avatar.png' with your actual avatar or logo */}
      <Image
        src="/profile.jpeg"
        alt="Ayotomiwa Salau"
        width={40}
        height={40}
        className="rounded-full"
      />
      <span className="ml-2 font-bold text-white text-lg">Ayotomiwa Salau</span>
    </div>
    </Link>
  );
};

export default Logo;
