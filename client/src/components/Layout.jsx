import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { logout } from "../auth";
import LogoIcon from "./Logo";

function DashboardIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlarmIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M18 16.5V11a6 6 0 0 0-12 0v5.5L4.5 19h15L18 16.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

function ThresholdIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M6 3v9a6 6 0 0 0 12 0V3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3h6M15 3h6M4 21h16" strokeLinecap="round" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" strokeLinecap="round" />
      <path d="M18 8.5v5M15.5 11h5" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8.5" cy="8" r="3" />
      <circle cx="16.5" cy="9" r="2.4" />
      <path d="M3 19c0-2.9 2.5-5 5.5-5s5.5 2.1 5.5 5" strokeLinecap="round" />
      <path d="M14 15.2c2.3.3 4 1.9 4 3.8" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 4H5.5a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 5.5 20H9" strokeLinecap="round" />
      <path d="M16 16l4-4-4-4M20 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true, icon: DashboardIcon },
  { to: "/history", label: "Lịch sử dữ liệu", icon: HistoryIcon },
  { to: "/alarms", label: "Lịch sử cảnh báo", icon: AlarmIcon },
];

const ADMIN_NAV_ITEMS = [
  { to: "/thresholds", label: "Cài đặt ngưỡng", icon: ThresholdIcon, end: true },
  { to: "/users", label: "Người dùng", icon: UsersIcon, end: true },
  { to: "/users/new", label: "Tạo người dùng", icon: UserPlusIcon, end: true },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = useAuth();
  const navItems = session?.role === "admin" ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <LogoIcon />
          Report
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">{session?.username}</div>
          <button type="button" className="nav-link logout-btn" onClick={handleLogout}>
            <LogoutIcon />
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="content">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
