import { useEffect, useState } from "react";
import { fetchJson } from "./api";
import { loadThresholds } from "./thresholds";
import { getSession } from "./auth";

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

export function useThresholds() {
  const [thresholds, setThresholds] = useState(loadThresholds);

  useEffect(() => {
    function onUpdate() {
      setThresholds(loadThresholds());
    }
    window.addEventListener("thresholds-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("thresholds-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return thresholds;
}

export function useAuth() {
  const [session, setSession] = useState(getSession);

  useEffect(() => {
    function onUpdate() {
      setSession(getSession());
    }
    window.addEventListener("auth-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    const id = setInterval(onUpdate, 30000);
    return () => {
      window.removeEventListener("auth-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
      clearInterval(id);
    };
  }, []);

  return session;
}
