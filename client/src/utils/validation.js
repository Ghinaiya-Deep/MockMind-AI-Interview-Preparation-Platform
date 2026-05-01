const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegister = ({ name, email, password, confirmPassword }) => {
  const errors = {};

  if (!name.trim() || name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters";
  }

  if (!emailRegex.test(email)) {
    errors.email = "Enter a valid email address";
  }

  if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  } else {
    if (!/[A-Z]/.test(password)) {
      errors.password = "Password must include one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must include one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must include one number";
    }
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!emailRegex.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (!password.trim()) {
    errors.password = "Password is required";
  }
  return errors;
};

