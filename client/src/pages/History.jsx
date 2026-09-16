import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePolled } from "../hooks";
import Card from "../components/Card";

const FREQ_KEYS = [
  "M02_Hz",
  "M07_Hz",
  "M5.1_Hz",
  "M5.2_Hz",
  "M5.3_Hz",
  "M5.4_Hz",
  "M5.5_Hz",
  "M5.6_Hz",
  "M5.7_Hz",
];

const COLORS = [
  "#4f8cff",
  "#2fbf71",
  "#f5a623",
  "#ef4444",
  "#a78bfa",
  "#22d3ee",
  "#f472b6",
  "#84cc16",
  "#fbbf24",
];

function formatTime(iso) {
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  return d.toLocaleTimeString("vi-VN", { hour12: false });
}

export default function History() {
  const [limit, setLimit] = useState(50);
  const { data, error } = usePolled(`/tags/history?limit=${limit}`, 10000);
  const [selected, setSelected] = useState(new Set(["M02_Hz", "M07_Hz"]));

  const chartData = (data || [])
    .slice()
    .reverse()
    .map((doc) => {
      const row = { time: formatTime(doc.timestamp) };
      FREQ_KEYS.forEach((k) => (row[k] = doc[k]));
      return row;
    });

  function toggle(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Lịch sử dữ liệu</h1>
          <p className="subtitle">Xu hướng tần số biến tần theo thời gian</p>
        </div>
      </header>

      {error && <div className="alarm-banner">Lỗi tải lịch sử: {error}</div>}

      <Card title="Chọn tag hiển thị">
        <div className="tag-toggle-grid">
          {FREQ_KEYS.map((key, i) => (
            <label key={key} className="tag-toggle">
              <input
                type="checkbox"
                checked={selected.has(key)}
                onChange={() => toggle(key)}
              />
              <span className="tag-toggle-swatch" style={{ background: COLORS[i] }} />
              {key}
            </label>
          ))}
        </div>
        <div className="limit-control">
          Số điểm dữ liệu:
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </Card>

      <Card title="Biểu đồ tần số (Hz)">
        {chartData.length === 0 ? (
          <p className="loading">Chưa có dữ liệu lịch sử.</p>
        ) : (
          <div style={{ width: "100%", height: 380 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#262d3a" strokeDasharray="3 3" />
                <XAxis dataKey="time" stroke="#8b93a3" fontSize={12} />
                <YAxis stroke="#8b93a3" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#161b24", border: "1px solid #262d3a", color: "#e6e9ef" }}
                />
                <Legend />
                {FREQ_KEYS.filter((k) => selected.has(k)).map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[FREQ_KEYS.indexOf(key)]}
                    dot={false}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
