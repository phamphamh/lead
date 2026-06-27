// Stable anonymous session id, persisted in localStorage. Client-only.
const KEY = "ga_session_id";

export function getSessionId(): string {
  // Guard for SSR / build — never touch window on the server.
  if (typeof window === "undefined") return "ssr";

  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

    window.localStorage.setItem(KEY, id);
    return id;
  } catch {
    // localStorage can throw (private mode, blocked) — fall back to a transient id.
    return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
