import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import { createFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

const feedbackValidation = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5."),
  body("improvement")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Improvement must be at least 10 characters.")
];

router.post("/", protect, feedbackValidation, createFeedback);

export default router;
