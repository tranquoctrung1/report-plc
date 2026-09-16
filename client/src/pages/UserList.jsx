import Card from "../components/Card";
import { getAllUsers } from "../auth";
import { ALL_TAGS } from "../tags";

function tagsLabel(user) {
  if (user.allowedTags === "*") return "Tất cả tag";
  if (!Array.isArray(user.allowedTags) || user.allowedTags.length === 0) return "Không có";
  return user.allowedTags.map((key) => ALL_TAGS.find((t) => t.key === key)?.label || key).join(", ");
}

export default function UserList() {
  const users = getAllUsers();

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Người dùng</h1>
          <p className="subtitle">Danh sách tài khoản và quyền xem tag</p>
        </div>
      </header>

      <Card title={`Danh sách (${users.length} tài khoản)`}>
        <div style={{ overflowX: "auto" }}>
          <table className="log-table">
            <thead>
              <tr>
                <th>Tên đăng nhập</th>
                <th>Vai trò</th>
                <th>Tag được xem</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username}>
                  <td>{u.username}</td>
                  <td>{u.role === "admin" ? "Admin" : "User"}</td>
                  <td>{tagsLabel(u)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
