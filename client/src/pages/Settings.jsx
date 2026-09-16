import { usePolled } from "../hooks";
import Card from "../components/Card";

export default function Settings() {
  const { data: cfg, error } = usePolled("/config", 15000);

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Cài đặt</h1>
          <p className="subtitle">Thông tin cấu hình hệ thống (chỉ đọc)</p>
        </div>
      </header>

      {error && <div className="alarm-banner">Lỗi tải cấu hình: {error}</div>}

      {cfg && (
        <>
          <Card title="Kết nối PLC">
            <div className="stat-row">
              <div className="stat">
                <div className="stat-label">Địa chỉ IP</div>
                <div className="stat-value">{cfg.plc_ip}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Rack / Slot</div>
                <div className="stat-value">{cfg.plc_rack} / {cfg.plc_slot}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Data Block</div>
                <div className="stat-value">DB{cfg.db_number}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Chu kỳ đọc</div>
                <div className="stat-value">{cfg.poll_interval_seconds}s</div>
              </div>
            </div>
          </Card>

          <Card title="Cơ sở dữ liệu">
            <div className="stat-row">
              <div className="stat">
                <div className="stat-label">MongoDB Database</div>
                <div className="stat-value">{cfg.mongo_db_name}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Collection Tags</div>
                <div className="stat-value">{cfg.collections.tags}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Collection Alarms</div>
                <div className="stat-value">{cfg.collections.alarms}</div>
              </div>
            </div>
          </Card>

          <Card title="Ghi chú">
            <p className="loading">
              Hệ thống chỉ đọc dữ liệu từ PLC (read-only), không ghi ngược. Thay đổi cấu hình cần sửa file{" "}
              <code>config.py</code> ở backend và khởi động lại service.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
