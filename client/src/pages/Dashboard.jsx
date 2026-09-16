import { usePolled, useAuth } from "../hooks";
import Card from "../components/Card";
import { formatDateTime } from "../formatDate";
import { isTagAllowed } from "../auth";
import { TRIGGER_TAGS, FREQ_TAGS, CIP_TAGS } from "../tags";

function filterAlarmEntries(alarms, session) {
  return Object.entries(alarms).filter(
    ([k]) => k !== "_id" && k !== "timestamp" && isTagAllowed(session, k)
  );
}

const FREQ_MAX = 50;

function formatTime(iso) {
  if (!iso) return "--";
  return formatDateTime(iso);
}

function TriggerGrid({ tags, entries }) {
  return (
    <div className="pill-grid">
      {entries.map(({ key, label }) => {
        const on = Boolean(tags[key]);
        return (
          <div key={key} className={`pill ${on ? "pill-on" : "pill-off"}`}>
            <span className="pill-dot" />
            <span className="pill-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function FreqBar({ label, value }) {
  const pct = Math.max(0, Math.min(100, (value / FREQ_MAX) * 100));
  return (
    <div className="freq-row">
      <div className="freq-label">{label}</div>
      <div className="freq-track">
        <div className="freq-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="freq-value">{value?.toFixed(1)} Hz</div>
    </div>
  );
}

function SystemStatus({ tags, pollIntervalSeconds }) {
  let online = false;
  let secondsAgo = null;
  if (tags?.timestamp && pollIntervalSeconds) {
    const ts = new Date(tags.timestamp.endsWith("Z") ? tags.timestamp : tags.timestamp + "Z");
    secondsAgo = Math.round((Date.now() - ts.getTime()) / 1000);
    online = secondsAgo <= pollIntervalSeconds * 2;
  }

  return (
    <div className="stat-row">
      <div className="stat">
        <div className="stat-label">Kết nối PLC</div>
        <div className="stat-value">
          <span className={`status-pill ${online ? "status-online" : "status-offline"}`}>
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </div>
      <div className="stat">
        <div className="stat-label">Cập nhật gần nhất</div>
        <div className="stat-value">{formatTime(tags?.timestamp)}</div>
      </div>
      <div className="stat">
        <div className="stat-label">Cách đây</div>
        <div className="stat-value">{secondsAgo !== null ? `${secondsAgo}s` : "—"}</div>
      </div>
    </div>
  );
}

function CipStat({ tagKey, label, tags }) {
  if (tagKey === "Tig_CIP") {
    return (
      <div className="stat">
        <div className="stat-label">{label}</div>
        <div className={`stat-value ${tags.Tig_CIP ? "stat-good" : ""}`}>
          {tags.Tig_CIP ? "Đang vệ sinh" : "Nghỉ"}
        </div>
      </div>
    );
  }
  if (tagKey === "Temp_PV") {
    return (
      <div className="stat">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{tags.Temp_PV?.toFixed(1)} °C</div>
      </div>
    );
  }
  if (tagKey === "Time_PV") {
    return (
      <div className="stat">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{tags.Time_PV?.toFixed(0)} s</div>
      </div>
    );
  }
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{tags.ID_RCP}</div>
    </div>
  );
}

function CipStatus({ tags, entries }) {
  return (
    <div className="stat-row">
      {entries.map(({ key, label }) => (
        <CipStat key={key} tagKey={key} label={label} tags={tags} />
      ))}
    </div>
  );
}

function AlarmPanel({ alarms, session }) {
  const entries = filterAlarmEntries(alarms, session);
  const active = entries.filter(([, v]) => v);

  if (entries.length === 0) {
    return <p className="loading">Tài khoản của bạn chưa được phân quyền xem cảnh báo nào.</p>;
  }

  return (
    <>
      {active.length > 0 ? (
        <div className="alarm-banner">
          ⚠ {active.length} cảnh báo đang hoạt động: {active.map(([k]) => k.replace("Alarm_", "")).join(", ")}
        </div>
      ) : (
        <div className="alarm-banner alarm-banner-ok">✓ Không có cảnh báo</div>
      )}
      <div className="alarm-grid">
        {entries.map(([key, value]) => (
          <div key={key} className={`alarm-chip ${value ? "alarm-chip-active" : ""}`}>
            {key.replace("Alarm_", "")}
          </div>
        ))}
      </div>
    </>
  );
}

export default function Dashboard() {
  const { data: tags, error: tagsError } = usePolled("/tags/latest");
  const { data: alarms, error: alarmsError } = usePolled("/alarms/latest");
  const { data: cfg } = usePolled("/config", 15000);
  const session = useAuth();

  const loading = !tags || !alarms;
  const visibleTriggers = TRIGGER_TAGS.filter(({ key }) => isTagAllowed(session, key));
  const visibleFreq = FREQ_TAGS.filter(({ key }) => isTagAllowed(session, key));
  const visibleCip = CIP_TAGS.filter(({ key }) => isTagAllowed(session, key));

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Giám sát dây chuyền theo thời gian thực</p>
        </div>
        <div className="header-meta">
          <span className="live-dot" />
          Cập nhật lúc {formatTime(tags?.timestamp)}
        </div>
      </header>

      {(tagsError || alarmsError) && (
        <div className="alarm-banner">Lỗi kết nối API: {tagsError || alarmsError}</div>
      )}

      {loading && !tagsError && <p className="loading">Đang tải dữ liệu...</p>}

      {tags && (
        <>
          <Card title="Trạng thái hệ thống">
            <SystemStatus tags={tags} pollIntervalSeconds={cfg?.poll_interval_seconds} />
          </Card>

          {visibleTriggers.length > 0 && (
            <Card title="Tín hiệu điều khiển">
              <TriggerGrid tags={tags} entries={visibleTriggers} />
            </Card>
          )}

          {visibleFreq.length > 0 && (
            <Card title="Tần số biến tần">
              <div className="freq-list">
                {visibleFreq.map(({ key, label }) => (
                  <FreqBar key={key} label={label} value={tags[key]} />
                ))}
              </div>
            </Card>
          )}

          {visibleCip.length > 0 && (
            <Card title="CIP - Vệ sinh hệ thống">
              <CipStatus tags={tags} entries={visibleCip} />
            </Card>
          )}
        </>
      )}

      {alarms && (
        <Card title="Cảnh báo" className="card-alarms">
          <AlarmPanel alarms={alarms} session={session} />
        </Card>
      )}
    </div>
  );
}
