import express from "express";
import { body } from "express-validator";
import {
  getCurrentUser,
  loginUser,
  registerUser
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must include at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must include at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must include at least one number.")
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
];

router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.get("/me", protect, getCurrentUser);

export default router;

