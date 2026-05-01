import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InputField from "../components/InputField";
import { loginApi } from "../api/authApi";
import { validateLogin } from "../utils/validation";

const initialForm = {
  email: "",
  password: ""
};

function LoginPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = location.state;
    if (!state?.justRegistered) {
      return;
    }

    if (state.registeredEmail) {
      setForm((prev) => ({ ...prev, email: state.registeredEmail }));
    }
    toast.success(
      state.successMessage ||
        "You have successfully registered. Now you can login with your data."
    );
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await loginApi(form);
      localStorage.setItem("mockmind_token", data.token);
      localStorage.setItem("mockmind_user", JSON.stringify(data.user));
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        setErrors((prev) => ({
          ...prev,
          [apiErrors[0].path]: apiErrors[0].msg
        }));
      } else {
        toast.error(error?.response?.data?.message || "Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="card auth-card">
        <h1 align="center">Welcome Back</h1>
        <p className="subtitle" align="center">Login to continue with MockMind.</p>
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            id="email"
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
          />
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Checking..." : "Login"}
          </button>
        </form>
        <p className="switch-link">
          New here? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
