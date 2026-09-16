import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import AlarmLog from "./pages/AlarmLog";
import Thresholds from "./pages/Thresholds";
import UserCreate from "./pages/UserCreate";
import UserList from "./pages/UserList";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="history" element={<History />} />
            <Route path="alarms" element={<AlarmLog />} />
            <Route element={<RequireAuth adminOnly />}>
              <Route path="thresholds" element={<Thresholds />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/new" element={<UserCreate />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
