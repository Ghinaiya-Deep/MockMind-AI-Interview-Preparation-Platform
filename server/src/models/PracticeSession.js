import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, default: "Theory" }
  },
  { _id: false }
);

const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    transcript: { type: String, default: "" },
    audioFileId: { type: String, default: "" }
  },
  { _id: false }
);

const ResultSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    correct: { type: Boolean, default: false },
    feedback: { type: String, default: "" }
  },
  { _id: false }
);

const PracticeSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    techStack: { type: String, default: "" },
    difficulty: { type: String, default: "" },
    languages: { type: [String], default: [] },
    score: { type: Number, default: null },
    questions: { type: [QuestionSchema], default: [] },
    answers: { type: [AnswerSchema], default: [] },
    results: { type: [ResultSchema], default: [] },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const PracticeSession = mongoose.model("PracticeSession", PracticeSessionSchema);

export default PracticeSession;
