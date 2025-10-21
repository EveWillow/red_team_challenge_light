// gamer-client/lib/session.js
import { randomUUID } from "crypto";

// Instead of using cookies, we simply generate a UUID once and persist it.
let cachedId = null;

export async function getOrSetSessionId() {
  // If already generated in this process, reuse
  if (cachedId) return cachedId;

  // Try to read from localStorage if running in browser
  if (typeof window !== "undefined") {
    const existing = localStorage.getItem("rtc_playerId");
    if (existing) {
      cachedId = existing;
      return cachedId;
    }
    const newId = randomUUID();
    localStorage.setItem("rtc_playerId", newId);
    cachedId = newId;
    return newId;
  }

  // Server side: just generate a new UUID each time
  cachedId = randomUUID();
  return cachedId;
}
