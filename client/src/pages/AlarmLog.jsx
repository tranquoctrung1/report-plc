import { useState } from "react";
import { usePolled } from "../hooks";
import Card from "../components/Card";

function formatDateTime(iso) {
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  return d.toLocaleString("vi-VN", { hour12: false });
}

function activeAlarmNames(doc) {
  return Object.entries(doc)
    .filter(([k, v]) => k !== "_id" && k !== "timestamp" && v)
    .map(([k]) => k.replace("Alarm_", ""));
}

export default function AlarmLog() {
  const [limit, setLimit] = useState(100);
  const { data, error } = usePolled(`/alarms/history?limit=${limit}`, 10000);
  const [onlyActive, setOnlyActive] = useState(true);

  const rows = (data || []).map((doc) => ({
    timestamp: doc.timestamp,
    active: activeAlarmNames(doc),
  }));
  const visible = onlyActive ? rows.filter((r) => r.active.length > 0) : rows;

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Lịch sử cảnh báo</h1>
          <p className="subtitle">Các lần ghi nhận cảnh báo theo thời gian</p>
        </div>
      </header>

      {error && <div className="alarm-banner">Lỗi tải lịch sử cảnh báo: {error}</div>}

      <Card title="Bộ lọc">
        <div className="limit-control">
          Số bản ghi:
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
        </div>
        <label className="tag-toggle" style={{ marginTop: "0.75rem" }}>
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
          Chỉ hiện bản ghi có cảnh báo
        </label>
      </Card>

      <Card title={`Nhật ký (${visible.length} bản ghi)`}>
        {visible.length === 0 ? (
          <p className="loading">Không có dữ liệu phù hợp.</p>
        ) : (
          <table className="log-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Cảnh báo</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.timestamp} className={row.active.length ? "row-alarm" : ""}>
                  <td>{formatDateTime(row.timestamp)}</td>
                  <td>{row.active.length ? row.active.join(", ") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
