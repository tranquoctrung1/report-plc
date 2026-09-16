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
import { usePolled, useThresholds, useAuth } from "../hooks";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import { exportRowsToXlsx } from "../exportXlsx";
import { formatDateTime, formatDateTimeForFilename } from "../formatDate";
import { isOutOfRange } from "../thresholds";
import { isTagAllowed } from "../auth";
import { FREQ_KEYS } from "../tags";

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

const PAGE_SIZE = 50;
const FETCH_LIMIT = 1000;
const DEFAULT_RANGE_HOURS = 2;

function localToIso(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function defaultStart() {
  return toDatetimeLocal(new Date(Date.now() - DEFAULT_RANGE_HOURS * 3600 * 1000));
}

function defaultEnd() {
  return toDatetimeLocal(new Date());
}

export default function History() {
  const session = useAuth();
  const allowedKeys = FREQ_KEYS.filter((key) => isTagAllowed(session, key));
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [selected, setSelected] = useState(() => new Set(allowedKeys));
  const [page, setPage] = useState(1);
  const thresholds = useThresholds();

  const params = new URLSearchParams({ limit: String(FETCH_LIMIT) });
  const startIso = localToIso(start);
  const endIso = localToIso(end);
  if (startIso) params.set("start", startIso);
  if (endIso) params.set("end", endIso);

  const { data, error } = usePolled(`/tags/history?${params.toString()}`, 10000);

  const chartData = (data || [])
    .slice()
    .reverse()
    .map((doc) => {
      const row = { time: formatDateTime(doc.timestamp) };
      allowedKeys.forEach((k) => (row[k] = doc[k]));
      return row;
    });

  const visibleKeys = allowedKeys.filter((k) => selected.has(k));

  const tableRows = chartData.slice().reverse();
  const totalPages = Math.max(1, Math.ceil(tableRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = tableRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function toggle(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(allowedKeys));
  }

  function selectNone() {
    setSelected(new Set());
  }

  function exportExcel() {
    const rangeLabel = `_${formatDateTimeForFilename(startIso)}_den_${formatDateTimeForFilename(endIso)}`;
    exportRowsToXlsx(
      chartData,
      "Lich su tan so",
      `lich_su_tan_so${rangeLabel}.xlsx`,
      (row, key) => key !== "time" && isOutOfRange(row[key], thresholds[key])
    );
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

      {allowedKeys.length === 0 && (
        <div className="alarm-banner">Tài khoản của bạn chưa được phân quyền xem tag nào.</div>
      )}

      <Card title="Bộ lọc">
        <div className="tag-toggle-grid">
          {allowedKeys.map((key) => (
            <label key={key} className="tag-toggle">
              <input
                type="checkbox"
                checked={selected.has(key)}
                onChange={() => toggle(key)}
              />
              <span className="tag-toggle-swatch" style={{ background: COLORS[FREQ_KEYS.indexOf(key)] }} />
              {key}
            </label>
          ))}
        </div>
        <div className="limit-control" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
          <button type="button" className="btn-link" onClick={selectAll}>Chọn tất cả</button>
          <button type="button" className="btn-link" onClick={selectNone}>Bỏ chọn</button>
          <span>Từ:</span>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          <span>Đến:</span>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          <button
            type="button"
            className="btn-link"
            onClick={() => {
              setStart(defaultStart());
              setEnd(defaultEnd());
            }}
          >
            2 giờ gần nhất
          </button>
          <button type="button" className="btn-link" onClick={exportExcel} disabled={chartData.length === 0}>
            Xuất Excel
          </button>
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
                {visibleKeys.map((key) => (
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

      <Card title={`Bảng dữ liệu (${tableRows.length} bản ghi)`}>
        {tableRows.length === 0 ? (
          <p className="loading">Chưa có dữ liệu lịch sử.</p>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="log-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    {visibleKeys.map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, i) => (
                    <tr key={i}>
                      <td>{row.time}</td>
                      {visibleKeys.map((key) => (
                        <td
                          key={key}
                          className={isOutOfRange(row[key], thresholds[key]) ? "value-out-of-range" : ""}
                        >
                          {row[key]?.toFixed ? row[key].toFixed(1) : row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
