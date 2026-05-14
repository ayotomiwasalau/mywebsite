import Link from 'next/link';
import React from 'react';
import { PostsSchema } from '../utils/interface';
import { urlCleaner } from '../utils/tools';

interface SharePosts {
  postSelected: PostsSchema;
}

const Share = ({ postSelected }: SharePosts) => {
  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ayotomiwasalau.com";
  const slug = postSelected.slug ?? urlCleaner(postSelected.title);
  const kindSegment = postSelected.kind === "project" ? "projects" : "blogs";
  const fullUrl = `${siteOrigin}/work/${kindSegment}/${slug}`;

  // Utility function to detect mobile devices
  const isMobileDevice = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Twitter share URLs
  const tweetText = encodeURIComponent(`${postSelected.title} ${fullUrl}`);
  const twitterAppUrl = `twitter://post?message=${tweetText}`;
  const twitterWebUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  // Facebook share URLs
  const fbWebUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
  // Using Facebook's deep link pattern to attempt opening the app.
  const fbAppUrl = `fb://facewebmodal/f?href=${encodeURIComponent(fbWebUrl)}`;

  // Fallback handlers for Twitter and Facebook sharing
  const handleTwitterShare = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isMobileDevice()) {
        window.location.href = twitterAppUrl;
      setTimeout(() => {
        const newWindow = window.open("", "_blank");
        newWindow!.location.href = twitterWebUrl;
      }, 1000);
    } else {
        const newWindow = window.open("", "_blank");
        newWindow!.location.href = twitterWebUrl;
    }
  };

  const handleFacebookShare = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isMobileDevice()) {
        window.location.href = fbAppUrl;
      setTimeout(() => {
        const newWindow = window.open("", "_blank");
        newWindow!.location.href = fbWebUrl;
      }, 1000);
    } else {
        const newWindow = window.open("", "_blank");
        newWindow!.location.href = fbWebUrl;
    }
  };

  // Other share URLs
  const shareUrls = {
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(postSelected.title + ' ' + fullUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(postSelected.title)}`,
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <div className="text-gray-800">
        <span className="font-semibold">Share</span>
      </div>

      <div className="flex flex-row text-gray-800 space-x-6">
        {/* Twitter Share */}
        <a
          onClick={handleTwitterShare}
          className="text-3xl cursor-pointer hover:opacity-70"
        >
          <i className="fa-brands fa-x-twitter"></i>
        </a>

        {/* LinkedIn Share */}
        <Link
          href={shareUrls.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-3xl cursor-pointer hover:opacity-70"
        >
          <i className="fa-brands fa-linkedin"></i>
        </Link>

        {/* WhatsApp Share */}
        <Link
          href={shareUrls.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="text-3xl cursor-pointer hover:opacity-70"
        >
          <i className="fa-brands fa-whatsapp"></i>
        </Link>

        {/* Telegram Share */}
        <Link
          href={shareUrls.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-3xl cursor-pointer hover:opacity-70"
        >
          <i className="fa-brands fa-telegram"></i>
        </Link>

        {/* Facebook Share */}
        <a
          onClick={handleFacebookShare}
          className="text-3xl cursor-pointer hover:opacity-70"
        >
          <i className="fa-brands fa-facebook"></i>
        </a>
      </div>
    </div>
  );
};

export default Share;
