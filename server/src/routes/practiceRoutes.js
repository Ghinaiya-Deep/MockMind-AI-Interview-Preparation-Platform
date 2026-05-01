import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { body } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import {
  evaluatePracticeAnswers,
  generatePracticeQuestions,
  getQuestionHelpFromChatbot,
  getPracticeSessions,
  uploadPracticeAnswer
} from "../controllers/practiceController.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || ".webm");
    cb(null, `answer-${unique}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "audio/webm",
    "audio/wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/x-m4a",
    "audio/aac",
    "audio/ogg"
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported audio format."), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const practiceValidation = [
  body("techStack")
    .trim()
    .notEmpty()
    .withMessage("Tech stack is required."),
  body("difficulty")
    .trim()
    .notEmpty()
    .withMessage("Difficulty level is required."),
  body("languages")
    .isArray({ min: 1 })
    .withMessage("At least one language must be selected."),
  body("languages.*")
    .trim()
    .notEmpty()
    .withMessage("Languages must be valid strings.")
];

router.post("/questions", protect, practiceValidation, generatePracticeQuestions);
router.post("/answers", protect, upload.single("audio"), uploadPracticeAnswer);
router.post("/evaluate", protect, evaluatePracticeAnswers);
router.post("/chatbot", protect, getQuestionHelpFromChatbot);
router.get("/sessions", protect, getPracticeSessions);

export default router;
