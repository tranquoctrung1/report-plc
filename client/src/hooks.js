import { useEffect, useState } from "react";
import { fetchJson } from "./api";

const POLL_MS = 5000;

export function usePolled(path, intervalMs = POLL_MS) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const json = await fetchJson(path);
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }

    run();
    const id = setInterval(run, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [path, intervalMs]);

  return { data, error };
}
