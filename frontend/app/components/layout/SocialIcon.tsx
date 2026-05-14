
import React from 'react'
import SocialIconLink from "./SocialIconLink";

interface SocialIconProps {
    href: string;
    label: string;
    icon: string;
    iconColor: string;
}

function SocialIcon({ href, label, icon, iconColor }: SocialIconProps) {
  return (
    <div>
        <SocialIconLink
            href= {href}
            label={label}
            iconColor={iconColor}
        >
            <i className={icon}></i>
        </SocialIconLink>
    </div>
  )
}

export default SocialIcon