import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";

const TOKEN_KEY = "portfolio_admin_token";
const EXPIRES_AT_KEY = "portfolio_admin_token_expires_at";

export interface AdminLoginResult {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const expiresAt = Number(localStorage.getItem(EXPIRES_AT_KEY) ?? "0");
  if (expiresAt > 0 && Date.now() >= expiresAt) {
    clearAdminSession();
    return null;
  }

  return token;
}

export function isAdminSessionValid(): boolean {
  return Boolean(getAdminAccessToken());
}

export function setAdminSession(accessToken: string, expiresInSeconds: number): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(
    EXPIRES_AT_KEY,
    String(Date.now() + expiresInSeconds * 1000),
  );
}

export function clearAdminSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<AdminLoginResult> {
  const response = await fetch(`${getFastApiRouteBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    let message = "Invalid admin credentials.";
    try {
      const data = (await response.json()) as { detail?: unknown };
      if (typeof data.detail === "string") message = data.detail;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = (await response.json()) as AdminLoginResult;
  setAdminSession(data.access_token, data.expires_in);
  return data;
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminAccessToken();
  if (!token) return false;

  const response = await fetch(`${getFastApiRouteBaseUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    clearAdminSession();
    return false;
  }

  return true;
}
