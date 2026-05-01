import express from "express";
import { body, param } from "express-validator";
import {
  adminLogin,
  adminLogout,
  deleteContactForAdmin,
  deleteFeedbackForAdmin,
  getAdminChartStats,
  getAdminMe,
  getAllContactsForAdmin,
  getAllFeedbacksForAdmin,
  getAllUsersForAdmin,
  getDashboardStats
} from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid admin email is required.")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Admin password is required.")
];

const idParamValidation = [
  param("id").isMongoId().withMessage("Valid resource id is required.")
];

router.post("/login", loginValidation, adminLogin);
router.post("/logout", protectAdmin, adminLogout);
router.get("/me", protectAdmin, getAdminMe);
router.get("/dashboard-stats", protectAdmin, getDashboardStats);
router.get("/chart-stats", protectAdmin, getAdminChartStats);
router.get("/users", protectAdmin, getAllUsersForAdmin);

router.get("/feedbacks", protectAdmin, getAllFeedbacksForAdmin);
router.delete(
  "/feedbacks/:id",
  protectAdmin,
  idParamValidation,
  deleteFeedbackForAdmin
);

router.get("/contacts", protectAdmin, getAllContactsForAdmin);
router.delete(
  "/contacts/:id",
  protectAdmin,
  idParamValidation,
  deleteContactForAdmin
);

export default router;
