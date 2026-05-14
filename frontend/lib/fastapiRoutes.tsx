/**
 * Backend REST base: ``${NEXT_PUBLIC_API_BASE_URL}/api/${NEXT_PUBLIC_API_VERSION}``
 * Mirrors ``backend/src/api_config.py``.
 */

function stripSlashes(segment: string): string {
  return segment.replace(/^\/+|\/+$/g, "").trim();
}

function normalizeApiVersion(raw: string | undefined): string {
  const s = stripSlashes(raw ?? "v1") || "v1";
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,30}$/.test(s)) {
    return "v1";
  }
  return s;
}

/** Host root without trailing slash (e.g. ``http://127.0.0.1:8000``). */
export function getFastApiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000").replace(/\/+$/, "");
}

/** Version segment (default ``v1``). Set ``NEXT_PUBLIC_API_VERSION`` at build/runtime. */
export function getFastApiVersion(): string {
  return normalizeApiVersion(process.env.NEXT_PUBLIC_API_VERSION);
}

/** Base URL for FastAPI routers (path prefix ``/api/{version}``); no trailing slash. */
export function getFastApiRouteBaseUrl(): string {
  const origin = getFastApiOrigin();
  const version = getFastApiVersion();
  return `${origin}/api/${version}`;
}
