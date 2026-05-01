import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InputField from "../components/InputField";
import { registerApi } from "../api/authApi";
import { validateRegister } from "../utils/validation";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: ""
};

function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegister(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      };
      const { data } = await registerApi(payload);
      navigate("/login", {
        state: {
          justRegistered: true,
          registeredEmail: payload.email,
          successMessage:
            data?.message ||
            "You have successfully registered. Now you can login with your data."
        },
        replace: true
      });
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        setErrors((prev) => ({
          ...prev,
          [apiErrors[0].path]: apiErrors[0].msg
        }));
      } else {
        toast.error(error?.response?.data?.message || "Registration failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="card auth-card">
        <h1 align="center">Create Account</h1>
        <p className="subtitle" align="center">Join MockMind and start your journey.</p>
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            id="name"
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your full name"
          />
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
            placeholder="Minimum 6 chars with A-z and number"
          />
          <InputField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Re-enter password"
          />
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Register"}
          </button>
        </form>
        <p className="switch-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
