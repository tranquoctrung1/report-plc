import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000/api";
const POLL_MS = 5000;

function useLatest(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOnce() {
      try {
        const res = await fetch(`${API_BASE}${path}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }

    fetchOnce();
    const id = setInterval(fetchOnce, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [path]);

  return { data, error };
}

function TagTable({ tags }) {
  const entries = Object.entries(tags).filter(([k]) => k !== "_id" && k !== "timestamp");
  return (
    <table>
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AlarmTable({ alarms }) {
  const entries = Object.entries(alarms).filter(([k]) => k !== "_id" && k !== "timestamp");
  return (
    <table>
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key} className={value ? "alarm-active" : ""}>
            <td>{key}</td>
            <td>{value ? "ACTIVE" : "ok"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function App() {
  const { data: tags, error: tagsError } = useLatest("/tags/latest");
  const { data: alarms, error: alarmsError } = useLatest("/alarms/latest");

  return (
    <div className="dashboard">
      <h1>report-plc dashboard</h1>

      <section>
        <h2>Tags {tags?.timestamp && <small>({tags.timestamp})</small>}</h2>
        {tagsError && <p className="error">Lỗi tải tags: {tagsError}</p>}
        {tags ? <TagTable tags={tags} /> : <p>Đang tải...</p>}
      </section>

      <section>
        <h2>Alarms {alarms?.timestamp && <small>({alarms.timestamp})</small>}</h2>
        {alarmsError && <p className="error">Lỗi tải alarms: {alarmsError}</p>}
        {alarms ? <AlarmTable alarms={alarms} /> : <p>Đang tải...</p>}
      </section>
    </div>
  );
}
