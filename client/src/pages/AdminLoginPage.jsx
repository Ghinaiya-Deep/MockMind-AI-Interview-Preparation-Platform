import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLoginApi } from "../api/adminApi";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data } = await adminLoginApi({ email, password });
      localStorage.setItem("mockmind_admin_token", data.token);
      localStorage.setItem("mockmind_admin_user", JSON.stringify(data.admin));
      navigate("/admin/dashboard");
    } catch (apiError) {
      const message =
        apiError?.response?.data?.message ||
        apiError?.response?.data?.errors?.[0]?.msg ||
        "Unable to login as admin.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="admin-login-kicker" align="center">MockMind Control Room</p>
        <h1 align="center">Admin Login</h1>
        {/* <p className="admin-login-subtitle">
          Access analytics, feedback, and contact monitoring.
        </p> */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="adminEmail">Admin Email</label>
            <input
              id="adminEmail"
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@mockmind.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="adminPassword">Password</label>
            <input
              id="adminPassword"
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
