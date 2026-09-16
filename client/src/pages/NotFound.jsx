import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page not-found">
      <svg
        className="not-found-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 1.3-1.2 1.8-2 2.5-.5.4-.5.9-.5 1.5" />
        <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
      </svg>
      <header className="header">
        <div>
          <h1>404</h1>
          <p className="subtitle">Không tìm thấy trang bạn yêu cầu</p>
        </div>
      </header>
      <Link to="/" className="btn-link">
        Về trang Dashboard
      </Link>
    </div>
  );
}
