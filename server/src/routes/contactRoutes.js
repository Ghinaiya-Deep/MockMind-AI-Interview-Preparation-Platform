import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import { createContactMessage } from "../controllers/contactController.js";

const router = express.Router();

const contactValidation = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  body("message")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters.")
];

router.post("/", protect, contactValidation, createContactMessage);

export default router;
