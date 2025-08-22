import axios from "axios";

let pending: Promise<boolean> | null = null;

// Waits for backend (Render cold start), gives up after ~2 min
// Concurrent callers share one ping loop
export const waitForServer = (onSlow: (slow: boolean) => void, attempts = 12): Promise<boolean> => {
  pending ||= (async () => {
    try {
      for (let i = 0; i < attempts; i++) {
        try {
          await axios.get("/ping", { timeout: 5000 });
          onSlow(false);
          return true;
        } catch {
          onSlow(true);
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
      return false;
    } finally {
      pending = null; // server can sleep again later, so don't cache result
    }
  })();
  return pending;
};
