/**
 * Client-side persistent guest ID.
 * Stored in localStorage so the same browser session is always identified
 * consistently without requiring authentication.
 */

const STORAGE_KEY = "matchday_guest_id";

export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
