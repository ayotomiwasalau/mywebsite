"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingPage from "../../shared/LoadingPage";
import { isAdminSessionValid, verifyAdminSession } from "@lib/adminAuth";
import { pathnameWithoutTrailingSlash } from "@lib/pathname";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/admin/logout"]);

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.has(pathnameWithoutTrailingSlash(pathname));
}

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      if (isPublicAdminPath(pathname)) {
        if (
          pathnameWithoutTrailingSlash(pathname) === "/admin/login" &&
          isAdminSessionValid()
        ) {
          const valid = await verifyAdminSession();
          if (cancelled) return;
          if (valid) {
            const params = new URLSearchParams(window.location.search);
            const next = params.get("next");
            router.replace(next && next.startsWith("/admin/") ? next : "/admin/dashboard");
            return;
          }
        }
        if (!cancelled) setReady(true);
        return;
      }

      if (!isAdminSessionValid()) {
        router.replace(
          `/admin/login?next=${encodeURIComponent(pathname)}`,
        );
        return;
      }

      const valid = await verifyAdminSession();
      if (cancelled) return;

      if (!valid) {
        router.replace(
          `/admin/login?next=${encodeURIComponent(pathname)}`,
        );
        return;
      }

      setReady(true);
    }

    setReady(false);
    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
