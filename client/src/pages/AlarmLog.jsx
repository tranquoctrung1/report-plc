import { useState } from "react";
import { usePolled, useAuth } from "../hooks";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import { exportRowsToXlsx } from "../exportXlsx";
import { formatDateTime, formatDateTimeForFilename } from "../formatDate";
import { isTagAllowed } from "../auth";
import { ALARM_KEYS } from "../tags";

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

function activeAlarmNames(doc, keys) {
  return keys.filter((k) => doc[k]).map((k) => k.replace("Alarm_", ""));
}

function hasAnyAlarm(doc, keys) {
  return keys.some((k) => doc[k]);
}

export default function AlarmLog() {
  const session = useAuth();
  const allowedKeys = ALARM_KEYS.filter((key) => isTagAllowed(session, key));
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [onlyActive, setOnlyActive] = useState(false);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");

  const params = new URLSearchParams({ limit: String(FETCH_LIMIT) });
  const startIso = localToIso(start);
  const endIso = localToIso(end);
  if (startIso) params.set("start", startIso);
  if (endIso) params.set("end", endIso);

  const { data, error } = usePolled(`/alarms/history?${params.toString()}`, 10000);

  const rows = (data || []).slice().reverse();
  const visible = onlyActive ? rows.filter((doc) => hasAnyAlarm(doc, allowedKeys)) : rows;

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function exportExcel() {
    const exportRows =
      viewMode === "grid"
        ? visible.map((doc) => {
            const row = { "Thời gian": formatDateTime(doc.timestamp) };
            allowedKeys.forEach((k) => {
              row[k.replace("Alarm_", "")] = doc[k] ? "Yes" : "-";
            });
            return row;
          })
        : visible.map((doc) => {
            const active = activeAlarmNames(doc, allowedKeys);
            return {
              "Thời gian": formatDateTime(doc.timestamp),
              "Cảnh báo": active.length ? active.join(", ") : "-",
            };
          });
    const rangeLabel = `_${formatDateTimeForFilename(startIso)}_den_${formatDateTimeForFilename(endIso)}`;
    exportRowsToXlsx(exportRows, "Nhat ky canh bao", `lich_su_canh_bao${rangeLabel}.xlsx`);
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Lịch sử cảnh báo</h1>
          <p className="subtitle">Trạng thái tất cả tag cảnh báo theo thời gian</p>
        </div>
      </header>

      {error && <div className="alarm-banner">Lỗi tải lịch sử cảnh báo: {error}</div>}

      {allowedKeys.length === 0 && (
        <div className="alarm-banner">Tài khoản của bạn chưa được phân quyền xem cảnh báo nào.</div>
      )}

      <Card title="Bộ lọc">
        <div className="limit-control" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
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
          <button type="button" className="btn-link" onClick={exportExcel} disabled={visible.length === 0}>
            Xuất Excel
          </button>
        </div>
        <label className="tag-toggle" style={{ marginTop: "0.75rem" }}>
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
          Chỉ hiện bản ghi có cảnh báo
        </label>
        <div className="view-mode-toggle" style={{ marginTop: "0.75rem" }}>
          <button
            type="button"
            className={`btn-link ${viewMode === "grid" ? "btn-link-active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            Dạng lưới (tất cả tag)
          </button>
          <button
            type="button"
            className={`btn-link ${viewMode === "list" ? "btn-link-active" : ""}`}
            onClick={() => {
              setViewMode("list");
              setOnlyActive(true);
            }}
          >
            Dạng danh sách
          </button>
        </div>
      </Card>

      <Card title={`Bảng dữ liệu (${visible.length} bản ghi)`}>
        {visible.length === 0 ? (
          <p className="loading">Không có dữ liệu phù hợp.</p>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="log-table">
                {viewMode === "grid" ? (
                  <>
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        {allowedKeys.map((key) => (
                          <th key={key}>{key.replace("Alarm_", "")}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.map((doc) => (
                        <tr key={doc.timestamp}>
                          <td>{formatDateTime(doc.timestamp)}</td>
                          {allowedKeys.map((key) => (
                            <td
                              key={key}
                              className={doc[key] ? "alarm-cell-active" : "alarm-cell-normal"}
                              title={key.replace("Alarm_", "")}
                            >
                              {doc[key] ? "●" : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Cảnh báo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.map((doc) => {
                        const active = activeAlarmNames(doc, allowedKeys);
                        return (
                          <tr key={doc.timestamp} className={active.length ? "row-alarm" : ""}>
                            <td>{formatDateTime(doc.timestamp)}</td>
                            <td>{active.length ? active.join(", ") : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </>
                )}
              </table>
            </div>
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
