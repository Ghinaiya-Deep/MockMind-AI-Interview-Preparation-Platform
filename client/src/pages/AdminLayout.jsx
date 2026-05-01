import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { adminLogoutApi, getAdminMeApi } from "../api/adminApi";

const getStoredAdmin = () => {
  try {
    const raw = localStorage.getItem("mockmind_admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

function AdminLayout() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    localStorage.getItem("mockmind_admin_theme") || "light"
  );
  const [admin, setAdmin] = useState(getStoredAdmin());

  const token = useMemo(() => localStorage.getItem("mockmind_admin_token"), []);

  useEffect(() => {
    localStorage.setItem("mockmind_admin_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    getAdminMeApi(token)
      .then(({ data }) => {
        setAdmin(data.admin);
        localStorage.setItem("mockmind_admin_user", JSON.stringify(data.admin));
      })
      .catch(() => {
        localStorage.removeItem("mockmind_admin_token");
        localStorage.removeItem("mockmind_admin_user");
        navigate("/admin/login");
      });
  }, [navigate, token]);

  const handleLogout = async () => {
    const currentToken = localStorage.getItem("mockmind_admin_token");
    if (currentToken) {
      try {
        await adminLogoutApi(currentToken);
      } catch (_error) {
        // Stateless JWT logout still clears local token on client.
      }
    }
    localStorage.removeItem("mockmind_admin_token");
    localStorage.removeItem("mockmind_admin_user");
    navigate("/admin/login");
  };

  return (
    <div className={`admin-shell ${theme}`}>
      <aside className="admin-sidebar">
        <div className="admin-brand-block">
          <p className="admin-brand-kicker">MockMind</p>
          <h2>Control Room</h2>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/feedback"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Feedback
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Users
          </NavLink>
          <NavLink
            to="/admin/contact"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Contact
          </NavLink>
          <button type="button" className="admin-nav-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <div className="admin-content-wrap">
        <header className="admin-topbar">
          <div>
            <p className="admin-topbar-title">Analytics and Monitoring</p>
            <p className="admin-topbar-subtitle">
              Real-time admin intelligence for MockMind growth.
            </p>
          </div>
          <div className="admin-topbar-actions">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
            <div className="admin-profile-chip">
              <span className="admin-avatar">
                {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
              </span>
              <div>
                <strong>{admin?.name || "Admin"}</strong>
                <p>{admin?.email || "admin@mockmind.com"}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
