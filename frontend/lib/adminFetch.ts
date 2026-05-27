import { clearAdminSession, getAdminAccessToken } from "@lib/adminAuth";

function redirectToAdminLogin(): void {
  if (typeof window === "undefined") return;
  clearAdminSession();
  const next = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.assign(`/admin/login?next=${next}`);
}

export async function adminFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const token = getAdminAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    redirectToAdminLogin();
  }

  return response;
}
