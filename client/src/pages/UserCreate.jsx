import { useState } from "react";
import Card from "../components/Card";
import { TRIGGER_TAGS, FREQ_TAGS, CIP_TAGS, ALARM_TAGS } from "../tags";
import { loadUsers, saveUsers, findUser } from "../auth";

const TAG_GROUPS = [
  { title: "Tín hiệu điều khiển", tags: TRIGGER_TAGS },
  { title: "Tần số biến tần", tags: FREQ_TAGS },
  { title: "CIP - Vệ sinh hệ thống", tags: CIP_TAGS },
  { title: "Cảnh báo (Alarm)", tags: ALARM_TAGS },
];

export default function UserCreate() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [allowedTags, setAllowedTags] = useState(new Set());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function toggleTag(key) {
    setAllowedTags((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectGroup(keys) {
    setAllowedTags((prev) => new Set([...prev, ...keys]));
  }

  function deselectGroup(keys) {
    setAllowedTags((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => next.delete(k));
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const name = username.trim();
    if (!name || !password) {
      setError("Nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }
    if (findUser(name)) {
      setError("Tên đăng nhập đã tồn tại");
      return;
    }

    const users = loadUsers();
    users.push({
      username: name,
      password,
      role: isAdmin ? "admin" : "user",
      allowedTags: isAdmin ? "*" : Array.from(allowedTags),
    });
    saveUsers(users);

    setSuccess(`Đã tạo tài khoản "${name}"`);
    setUsername("");
    setPassword("");
    setIsAdmin(false);
    setAllowedTags(new Set());
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Tạo người dùng</h1>
          <p className="subtitle">Tạo tài khoản và phân quyền xem tag</p>
        </div>
      </header>

      {error && <div className="alarm-banner">{error}</div>}
      {success && <div className="alarm-banner alarm-banner-ok">{success}</div>}

      <Card title="Thông tin tài khoản">
        <form onSubmit={handleSubmit} className="user-form" autoComplete="off">
          <div className="form-row">
            <label className="login-field">
              Tên đăng nhập
              <input
                className="text-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                name="new-username-field"
              />
            </label>
            <label className="login-field">
              Mật khẩu
              <input
                type="password"
                className="text-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                name="new-password-field"
              />
            </label>
          </div>

          <label className="role-switch">
            <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            <span>Quyền admin (xem toàn bộ tag)</span>
          </label>

          {!isAdmin &&
            TAG_GROUPS.map(({ title, tags }) => {
              const keys = tags.map((t) => t.key);
              const allSelected = keys.every((k) => allowedTags.has(k));
              return (
                <div key={title} className="tag-group">
                  <div className="tag-group-header">
                    <span className="tag-group-title">{title}</span>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => (allSelected ? deselectGroup(keys) : selectGroup(keys))}
                    >
                      {allSelected ? "Bỏ chọn nhóm" : "Chọn tất cả nhóm"}
                    </button>
                  </div>
                  <div className="tag-chip-grid">
                    {tags.map(({ key, label }) => (
                      <label key={key} className="tag-chip">
                        <input
                          type="checkbox"
                          checked={allowedTags.has(key)}
                          onChange={() => toggleTag(key)}
                        />
                        <span>
                          {label} <span className="tag-chip-key">({key})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

          <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem", alignSelf: "flex-start" }}>
            Tạo tài khoản
          </button>
        </form>
      </Card>
    </div>
  );
}
