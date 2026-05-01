import { validationResult } from "express-validator";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";
import mongoose from "mongoose";
import PracticeSession from "../models/PracticeSession.js";

const buildPrompt = ({ techStack, difficulty, languages }) => `
You are an expert interview coach. Create 10 realistic interview questions for a ${techStack} candidate.
Difficulty level: ${difficulty}.
Programming languages to consider: ${languages.join(", ")}.

Rules:
- Provide exactly 10 questions.
- 5 questions must be theory-based.
- 5 questions must be programming/code-based.
- Questions should match real interview preparation.
- Return ONLY valid JSON in this format:
{
  "questions": [
    { "type": "theory", "question": "..." },
    { "type": "code", "question": "..." }
  ]
}
`;

const sanitizeJson = (rawText) =>
  rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

let gridBucket;
const getGridBucket = () => {
  if (!gridBucket) {
    gridBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "practiceAudio"
    });
  }
  return gridBucket;
};

const ensureUploadsDir = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const buildEvaluationPrompt = ({ questions, answers }) => `
You are an interview evaluator. Compare each user answer to its question.
Return ONLY valid JSON in this exact format:
{
  "results": [
    { "questionId": "...", "correct": true, "feedback": "..." }
  ],
  "score": 0
}

Rules:
- "correct" must be true if the answer is broadly correct, otherwise false.
- Provide short, helpful feedback for each answer.
- "score" is an integer 0-100 based on overall correctness.

Questions:
${questions.map((q) => `- (${q.id}) ${q.text}`).join("\n")}

Answers:
${answers.map((a) => `- (${a.questionId}) ${a.transcript}`).join("\n")}
`;

const buildChatbotPrompt = ({
  techStack,
  difficulty,
  languages,
  selectedQuestion,
  userMessage,
  history
}) => `
You are MockMind Assistant, a friendly interview coach.
Help the learner understand interview questions in simple and practical terms.

Session context:
- Tech stack: ${techStack || "Not specified"}
- Difficulty: ${difficulty || "Not specified"}
- Languages: ${(languages || []).join(", ") || "Not specified"}

Selected interview question:
${selectedQuestion || "Not provided"}

User confusion/request:
${userMessage || "Please explain this question."}

Recent chat history:
${(history || [])
    .map((item) => `- ${item.role}: ${item.content}`)
    .join("\n") || "- none"}

Response rules:
- Keep the tone supportive and easy to understand.
- Use short, simple sentences.
- Keep it concise (around 80-140 words).
- Do not use markdown symbols like ** or #.
- Follow this exact plain-text format with blank lines:
What it asks:
<1-2 lines>

Core idea:
<2-3 lines>

Simple example:
<2-3 lines>

Quick takeaway:
<1 line>
- Return plain text only (no JSON).
`;

const buildChatbotFallbackReply = ({ selectedQuestion, userMessage }) => {
  const focus = (userMessage || selectedQuestion || "").trim();
  if (!focus) {
    return "Share the concept or question you want to understand, and I will explain it in simple words with an example.";
  }

  return [
    `Let's break this down: "${focus.slice(0, 180)}"`,
    "What it asks:\nIdentify the key concept and how to explain it in interview language.",
    "Core idea:\nDefine the term first, then connect it to why it matters in real systems.",
    "Simple example:\nShow one small real-world use case in 2-3 lines.",
    "Quick takeaway:\nAsk again with 'beginner', 'intermediate', or 'advanced' for a tailored explanation."
  ].join("\n\n");
};

const normalizeChatbotReply = (text) => {
  const input = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!input) return "";

  const cleaned = input
    .replace(/\*\*/g, "")
    .replace(/(?:^|\n)\s*AI:\s*/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const labels = [
    "What it asks:",
    "Core idea:",
    "Simple example:",
    "Quick takeaway:"
  ];

  let withSections = cleaned;
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\s*${escaped}`, "gi");
    withSections = withSections.replace(re, `\n\n${label}`);
  }

  return withSections.replace(/^\s+/, "").replace(/\n{3,}/g, "\n\n").trim();
};

export const generatePracticeQuestions = async (req, res, next) => {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({
        message: "GROQ_API_KEY is not configured on the server."
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { techStack, difficulty, languages } = req.body;

    const groq = new Groq({ apiKey: groqKey });
    const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    const groqResponse = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        {
          role: "system",
          content:
            "You are an expert interview coach. Follow the user instructions exactly and return ONLY valid JSON."
        },
        {
          role: "user",
          content: buildPrompt({ techStack, difficulty, languages })
        }
      ],
      temperature: 0.2
    });
    const outputText = groqResponse?.choices?.[0]?.message?.content || "";
    const cleaned = sanitizeJson(outputText);
    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      return res.status(502).json({
        message: "Failed to parse AI response. Please try again.",
        raw: outputText.slice(0, 2000)
      });
    }

    if (!parsed?.questions || parsed.questions.length !== 10) {
      return res.status(502).json({
        message: "AI response did not return 10 questions. Please try again."
      });
    }

    res.status(200).json({
      questions: parsed.questions
    });
  } catch (error) {
    next(error);
  }
};

export const uploadPracticeAnswer = async (req, res, next) => {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({
        message: "GROQ_API_KEY is not configured on the server."
      });
    }

    ensureUploadsDir();

    const file = req.file;
    const questionId = req.body.questionId;
    if (!file) {
      return res.status(400).json({ message: "Audio file is required." });
    }
    if (!questionId) {
      return res.status(400).json({ message: "questionId is required." });
    }

    const groq = new Groq({ apiKey: groqKey });
    const transcriptResponse = await groq.audio.transcriptions.create({
      file: fs.createReadStream(file.path),
      model: process.env.GROQ_TRANSCRIBE_MODEL || "whisper-large-v3",
      response_format: "json"
    });

    const transcript = transcriptResponse?.text || "";
    if (!transcript) {
      return res.status(502).json({
        message: "Failed to transcribe audio. Please try again."
      });
    }

    const fileId = await new Promise((resolve, reject) => {
      const bucket = getGridBucket();
      const uploadStream = bucket.openUploadStream(file.filename, {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          questionId,
          userId: req.user?._id?.toString() || ""
        }
      });
      const fileStream = fs.createReadStream(file.path);
      fileStream.on("error", reject);
      uploadStream.on("error", reject);
      uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
      fileStream.pipe(uploadStream);
    });

    fs.promises.unlink(file.path).catch(() => { });

    res.status(200).json({
      questionId,
      transcript,
      fileId
    });
  } catch (error) {
    next(error);
  }
};

export const evaluatePracticeAnswers = async (req, res, next) => {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({
        message: "GROQ_API_KEY is not configured on the server."
      });
    }

    const { questions, answers, sessionMeta } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions are required." });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required." });
    }

    const groq = new Groq({ apiKey: groqKey });
    const groqModel = process.env.GROQ_EVAL_MODEL || "llama-3.1-8b-instant";
    const evalResponse = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        {
          role: "system",
          content:
            "You are a strict evaluator. Return ONLY valid JSON matching the requested format."
        },
        {
          role: "user",
          content: buildEvaluationPrompt({ questions, answers })
        }
      ],
      temperature: 0.2
    });

    const outputText = evalResponse?.choices?.[0]?.message?.content || "";
    const cleaned = sanitizeJson(outputText);
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      return res.status(502).json({
        message: "Failed to parse evaluation response. Please try again.",
        raw: outputText.slice(0, 2000)
      });
    }

    if (!parsed?.results || !Array.isArray(parsed.results)) {
      return res.status(502).json({
        message: "Evaluation response is invalid. Please try again."
      });
    }

    const normalizedQuestions = questions.map((question) => ({
      id: String(question.id || question.questionId || ""),
      text: String(question.text || question.questionText || ""),
      type: String(question.type || question.questionType || "Theory")
    }));

    const normalizedAnswers = answers.map((answer) => ({
      questionId: String(answer.questionId || ""),
      transcript: String(answer.transcript || ""),
      audioFileId: String(answer.audioFileId || "")
    }));

    const normalizedResults = parsed.results.map((result) => ({
      questionId: String(result.questionId || ""),
      correct: Boolean(result.correct),
      feedback: String(result.feedback || "")
    }));

    const parsedSubmittedAt = sessionMeta?.submittedAt
      ? new Date(sessionMeta.submittedAt)
      : null;

    const payload = {
      user: req.user?._id,
      techStack: sessionMeta?.techStack || "",
      difficulty: sessionMeta?.difficulty || "",
      languages: Array.isArray(sessionMeta?.languages)
        ? sessionMeta.languages
        : [],
      score: Number.isFinite(parsed.score) ? parsed.score : null,
      questions: normalizedQuestions,
      answers: normalizedAnswers,
      results: normalizedResults,
      submittedAt:
        parsedSubmittedAt && !Number.isNaN(parsedSubmittedAt.getTime())
          ? parsedSubmittedAt
          : new Date()
    };

    if (!payload.user) {
      return res.status(401).json({ message: "User is not authenticated." });
    }

    await PracticeSession.create(payload);

    res.status(200).json(parsed);
  } catch (error) {
    next(error);
  }
};

export const getQuestionHelpFromChatbot = async (req, res, next) => {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({
        message: "GROQ_API_KEY is not configured on the server."
      });
    }

    const {
      techStack = "",
      difficulty = "",
      languages = [],
      selectedQuestion = "",
      userMessage = "",
      history = []
    } = req.body || {};

    if (!selectedQuestion && !userMessage) {
      return res.status(400).json({
        message: "selectedQuestion or userMessage is required."
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-8)
          .map((item) => ({
            role: item.role,
            content: item.content.slice(0, 700)
          }))
      : [];

    const groq = new Groq({ apiKey: groqKey });
    const groqModel = process.env.GROQ_CHAT_MODEL || "llama-3.1-8b-instant";
    const response = await groq.chat.completions.create({
      model: groqModel,
      messages: [
        {
          role: "system",
          content:
            "You are an interview mentor assistant. Provide clear concept explanations."
        },
        {
          role: "user",
          content: buildChatbotPrompt({
            techStack,
            difficulty,
            languages: Array.isArray(languages) ? languages : [],
            selectedQuestion: String(selectedQuestion || "").slice(0, 1800),
            userMessage: String(userMessage || "").slice(0, 1200),
            history: safeHistory
          })
        }
      ],
      temperature: 0.3
    });

    const reply = normalizeChatbotReply(
      response?.choices?.[0]?.message?.content?.trim()
    );
    if (!reply) {
      return res.status(200).json({
        reply: buildChatbotFallbackReply({ selectedQuestion, userMessage }),
        fallback: true
      });
    }

    res.status(200).json({ reply, fallback: false });
  } catch (error) {
    console.error("Chatbot help failed:", error?.message || error);
    const { selectedQuestion = "", userMessage = "" } = req.body || {};
    res.status(200).json({
      reply: buildChatbotFallbackReply({ selectedQuestion, userMessage }),
      fallback: true
    });
  }
};

export const getPracticeSessions = async (req, res, next) => {
  try {
    const sessions = await PracticeSession.find({ user: req.user?._id })
      .sort({ submittedAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ sessions });
  } catch (error) {
    next(error);
  }
};
