import { useState } from "react";
import Card from "../components/Card";
import { loadThresholds, saveThresholds } from "../thresholds";
import { FREQ_TAGS as TAGS } from "../tags";

function parseNumber(value) {
  if (value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export default function Thresholds() {
  const [form, setForm] = useState(() => {
    const stored = loadThresholds();
    const initial = {};
    TAGS.forEach(({ key }) => {
      initial[key] = {
        min: stored[key]?.min ?? "",
        max: stored[key]?.max ?? "",
      };
    });
    return initial;
  });
  const [savedAt, setSavedAt] = useState(null);

  function updateField(key, field, value) {
    setForm((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
    setSavedAt(null);
  }

  function handleSave() {
    const result = {};
    TAGS.forEach(({ key }) => {
      const min = parseNumber(form[key].min);
      const max = parseNumber(form[key].max);
      if (min !== null || max !== null) {
        result[key] = { min, max };
      }
    });
    saveThresholds(result);
    setSavedAt(new Date());
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Cài đặt ngưỡng</h1>
          <p className="subtitle">Ngưỡng trên / dưới cho các tag tần số (không áp dụng cho Alarm_List)</p>
        </div>
      </header>

      <Card title="Ngưỡng theo tag">
        <table className="log-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Ngưỡng dưới</th>
              <th>Ngưỡng trên</th>
            </tr>
          </thead>
          <tbody>
            {TAGS.map(({ key, label }) => (
              <tr key={key}>
                <td>{label} ({key})</td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    className="threshold-input"
                    value={form[key].min}
                    onChange={(e) => updateField(key, "min", e.target.value)}
                    placeholder="—"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    className="threshold-input"
                    value={form[key].max}
                    onChange={(e) => updateField(key, "max", e.target.value)}
                    placeholder="—"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="limit-control" style={{ marginTop: "1rem" }}>
          <button type="button" className="btn-link" onClick={handleSave}>
            Lưu ngưỡng
          </button>
          {savedAt && <span className="pagination-info">Đã lưu lúc {savedAt.toLocaleTimeString("vi-VN", { hour12: false })}</span>}
        </div>
      </Card>
    </div>
  );
}
