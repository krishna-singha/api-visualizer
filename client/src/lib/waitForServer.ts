import axios from "axios";

let pending: Promise<boolean> | null = null;

// Waits for backend (Render cold start)
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
      pending = null;
    }
  })();
  return pending;
};
