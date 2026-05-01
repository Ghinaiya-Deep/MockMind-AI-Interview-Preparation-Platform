import { useEffect, useState } from "react";
import { getAdminUsersApi } from "../api/adminApi";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("mockmind_admin_token");
    if (!token) {
      return;
    }

    getAdminUsersApi(token)
      .then(({ data }) => {
        setUsers(data.users || []);
        setTotalUsers(Number(data.totalUsers || 0));
      })
      .catch((apiError) => {
        setError(
          apiError?.response?.data?.message ||
            apiError?.response?.data?.errors?.[0]?.msg ||
            "Unable to load users."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="admin-state-card">Loading users...</div>;
  }

  return (
    <section className="admin-table-page">
      <div className="admin-table-header">
        <h2>User Accounts</h2>
        <div className="admin-total-pill">
          Total Users: <strong>{totalUsers}</strong>
        </div>
      </div>

      {error ? <div className="admin-state-card error">{error}</div> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Created On</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="admin-empty-cell">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td>{new Date(user.updatedAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminUsersPage;
