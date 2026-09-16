import { usePolled } from "../hooks";
import Card from "../components/Card";

const TRIGGER_LABELS = {
  SS1: "Nạp liệu máy trộn",
  SS2: "Van Pre1",
  SS3: "Van Pre2",
  SS4: "Van Pre3",
  SS5: "Xả liệu máy trộn",
  SS6: "Spare",
  SS7: "SS7",
  SS8: "SS8",
};

const FREQ_LABELS = {
  M02_Hz: "Máy trộn (M02)",
  M07_Hz: "Làm nguội (M07)",
  "M5.1_Hz": "Quạt làm nguội M5.1",
  "M5.2_Hz": "Quạt làm nguội M5.2",
  "M5.3_Hz": "Quạt làm nguội M5.3",
  "M5.4_Hz": "Quạt làm nguội M5.4",
  "M5.5_Hz": "Quạt làm nguội M5.5",
  "M5.6_Hz": "Quạt làm nguội M5.6",
  "M5.7_Hz": "Quạt làm nguội M5.7",
};

const FREQ_MAX = 50;

function formatTime(iso) {
  if (!iso) return "--";
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  return d.toLocaleTimeString("vi-VN", { hour12: false });
}

function TriggerGrid({ tags }) {
  return (
    <div className="pill-grid">
      {Object.entries(TRIGGER_LABELS).map(([key, label]) => {
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

function CipStatus({ tags }) {
  return (
    <div className="stat-row">
      <div className="stat">
        <div className="stat-label">Trạng thái</div>
        <div className={`stat-value ${tags.Tig_CIP ? "stat-good" : ""}`}>
          {tags.Tig_CIP ? "Đang vệ sinh" : "Nghỉ"}
        </div>
      </div>
      <div className="stat">
        <div className="stat-label">Nhiệt độ bồn nóng</div>
        <div className="stat-value">{tags.Temp_PV?.toFixed(1)} °C</div>
      </div>
      <div className="stat">
        <div className="stat-label">Thời gian CIP</div>
        <div className="stat-value">{tags.Time_PV?.toFixed(0)} s</div>
      </div>
      <div className="stat">
        <div className="stat-label">Số mẻ sản xuất</div>
        <div className="stat-value">{tags.ID_RCP}</div>
      </div>
    </div>
  );
}

function AlarmPanel({ alarms }) {
  const entries = Object.entries(alarms).filter(([k]) => k !== "_id" && k !== "timestamp");
  const active = entries.filter(([, v]) => v);

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

  const loading = !tags || !alarms;

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
          <Card title="Tín hiệu điều khiển">
            <TriggerGrid tags={tags} />
          </Card>

          <Card title="Tần số biến tần">
            <div className="freq-list">
              {Object.entries(FREQ_LABELS).map(([key, label]) => (
                <FreqBar key={key} label={label} value={tags[key]} />
              ))}
            </div>
          </Card>

          <Card title="CIP - Vệ sinh hệ thống">
            <CipStatus tags={tags} />
          </Card>
        </>
      )}

      {alarms && (
        <Card title="Cảnh báo" className="card-alarms">
          <AlarmPanel alarms={alarms} />
        </Card>
      )}
    </div>
  );
}
