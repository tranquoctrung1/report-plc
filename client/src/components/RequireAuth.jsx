import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks";

export default function RequireAuth({ adminOnly = false }) {
  const session = useAuth();

  if (!session) return <Navigate to="/login" replace />;
  if (adminOnly && session.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}
