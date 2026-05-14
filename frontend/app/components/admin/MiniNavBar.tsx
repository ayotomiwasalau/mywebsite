import Link from "next/link";
import React from "react";

const MINI_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Content", href: "/admin/workcontent" },
  { label: "Images", href: "/admin/workimages" },
  { label: "Subscribers", href: "/admin/subscribers" },
  { label: "Logout", href: "/admin/logout" },
] as const;

const MiniNavBar = () => {
  return (
    <div className=" w-full bg-white py-3">
      <div className="mx-auto w-full max-w-[600px] px-5">
        <div className="w-full rounded-xl bg-[#E8A193] px-4 py-2">
          <ul className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#333333]">
            {MINI_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition hover:text-[#111111] hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MiniNavBar;
