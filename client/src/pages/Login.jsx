import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../auth";
import LogoIcon from "../components/Logo";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const session = await login(username.trim(), password);
    if (!session) {
      setError("Sai tên đăng nhập hoặc mật khẩu");
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} autoComplete="off">
        <div className="login-logo">
          <LogoIcon size={44} />
        </div>
        <h1>Đăng nhập</h1>
        <p className="subtitle login-subtitle">Report — Giám sát dây chuyền</p>

        {error && <div className="alarm-banner">{error}</div>}

        <label className="login-field">
          Tên đăng nhập
          <input
            className="text-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            name="login-username-field"
            autoFocus
          />
        </label>
        <label className="login-field">
          Mật khẩu
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              className="text-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              name="login-password-field"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
        </label>

        <button type="submit" className="btn-primary login-submit">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
