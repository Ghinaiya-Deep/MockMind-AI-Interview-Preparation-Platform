import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  evaluateAnswersApi,
  generateQuestionsApi,
  getChatbotHelpApi,
  uploadAnswerAudioApi
} from "../api/practiceApi";

function PracticeQuestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const { techStack, difficulty, languages } = state;
  const [questions, setQuestions] = useState([]);
  const [recordings, setRecordings] = useState({});
  const [isUploading, setIsUploading] = useState({});
  const [results, setResults] = useState({});
  const [sessionScore, setSessionScore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeRecordingId, setActiveRecordingId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [selectedQuestionForChat, setSelectedQuestionForChat] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const stackLabel = techStack
    ? techStack.charAt(0).toUpperCase() + techStack.slice(1)
    : "Your stack";
  const difficultyLabel = difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : "Difficulty";

  useEffect(() => {
    if (!techStack || !difficulty || !languages || languages.length === 0) {
      navigate("/practice");
    }
  }, [difficulty, languages, navigate, techStack]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!techStack || !difficulty || !languages || languages.length === 0) {
        return;
      }
      const token = localStorage.getItem("mockmind_token");
      if (!token) {
        navigate("/login");
        return;
      }
      setIsLoading(true);
      setErrorMessage("");
      try {
        const { data } = await generateQuestionsApi(
          {
            techStack,
            difficulty,
            languages,
          },
          token
        );
        setQuestions(
          (data.questions || []).map((question, index) => ({
            id: `${question.type}-${index}`,
            type:
              question.type?.toLowerCase() === "code" ? "Code" : "Theory",
            text: question.question || question.text || "",
          }))
        );
        setRecordings({});
        setResults({});
        setSessionScore(null);
        setChatMessages([
          {
            role: "assistant",
            content:
              "I am here to help. Click any question text to copy it here, then ask your doubt."
          }
        ]);
        setChatInput("");
        setChatError("");
        setSelectedQuestionForChat("");
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          "Failed to generate questions. Please try again.";
        setErrorMessage(message);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [difficulty, languages, navigate, techStack]);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chatMessages, chatLoading, isChatOpen]);

  const questionCount = useMemo(() => questions.length, [questions]);
  const allAnswered =
    questionCount > 0 &&
    questions.every(
      (question) =>
        recordings[question.id]?.transcript &&
        recordings[question.id].transcript.trim().length > 0
    );

  const inferTopic = (question) => {
    if (!question?.text) return question?.type === "Code"
      ? "Coding practice"
      : "Concept clarity";
    const text = question.text.toLowerCase();
    const topicMap = [
      {
        topic: "Data Structures",
        keywords: [
          "array",
          "linked list",
          "stack",
          "queue",
          "tree",
          "graph",
          "heap",
          "hash",
          "map",
          "set",
          "trie"
        ]
      },
      {
        topic: "Algorithms",
        keywords: [
          "sort",
          "search",
          "binary",
          "dfs",
          "bfs",
          "dijkstra",
          "complexity",
          "big o",
          "time complexity",
          "space complexity"
        ]
      },
      {
        topic: "Databases & SQL",
        keywords: [
          "sql",
          "database",
          "db",
          "join",
          "index",
          "normalization",
          "transaction",
          "acid",
          "query"
        ]
      },
      {
        topic: "System Design",
        keywords: [
          "scalability",
          "load",
          "cache",
          "microservice",
          "distributed",
          "latency",
          "throughput",
          "queue",
          "message",
          "api gateway"
        ]
      },
      {
        topic: "JavaScript",
        keywords: [
          "javascript",
          "js",
          "closure",
          "hoisting",
          "event loop",
          "promise",
          "async",
          "await",
          "prototype",
          "this"
        ]
      },
      {
        topic: "React",
        keywords: [
          "react",
          "hook",
          "state",
          "props",
          "context",
          "jsx",
          "component",
          "redux"
        ]
      },
      {
        topic: "Node & Backend",
        keywords: [
          "node",
          "express",
          "api",
          "rest",
          "http",
          "middleware",
          "server"
        ]
      },
      {
        topic: "OOP & Design",
        keywords: [
          "class",
          "object",
          "inheritance",
          "polymorphism",
          "encapsulation",
          "interface",
          "solid",
          "design pattern"
        ]
      },
      {
        topic: "Core Theory",
        keywords: [
          "operating system",
          "os",
          "memory",
          "thread",
          "process",
          "scheduling",
          "concurrency",
          "deadlock",
          "network",
          "tcp",
          "udp"
        ]
      }
    ];

    const matched = topicMap.find((entry) =>
      entry.keywords.some((keyword) => text.includes(keyword))
    );
    if (matched) return matched.topic;
    return question.type === "Code" ? "Coding practice" : "Concept clarity";
  };

  const resultsSummary = useMemo(() => {
    if (!questionCount || Object.keys(results).length === 0) return null;
    const correctCount = questions.reduce(
      (acc, question) => acc + (results[question.id]?.correct ? 1 : 0),
      0
    );
    const totalCount = questions.length;
    const score =
      typeof sessionScore === "number"
        ? sessionScore
        : Math.round((correctCount / totalCount) * 100);
    const wrongQuestions = questions.filter(
      (question) => !results[question.id]?.correct
    );
    const topicCounts = wrongQuestions.reduce((acc, question) => {
      const topic = inferTopic(question);
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});
    const weakTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic)
      .slice(0, 3);

    let praise = "Keep practicing — you're close.";
    if (score >= 85) praise = "Amazing work!";
    else if (score >= 70) praise = "Great job!";
    else if (score >= 55) praise = "Good effort!";

    const subtitle =
      weakTopics.length > 0
        ? `You answered ${correctCount}/${totalCount} correctly. Focus next on ${weakTopics.join(
            ", "
          )}.`
        : `You answered ${correctCount}/${totalCount} correctly. No weak topics detected in this round.`;

    return {
      correctCount,
      totalCount,
      score,
      weakTopics,
      praise,
      subtitle,
      tone:
        score >= 85 ? "excellent" : score >= 70 ? "strong" : score >= 55 ? "steady" : "focus"
    };
  }, [questionCount, questions, results, sessionScore]);

  const handleSelectQuestionForChat = (questionText) => {
    const trimmedQuestion = (questionText || "").trim();
    if (!trimmedQuestion) return;

    setSelectedQuestionForChat(trimmedQuestion);
    setChatInput(trimmedQuestion);
    setChatError("");
    setIsChatOpen(true);

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(trimmedQuestion).catch(() => {});
    }
  };

  const handleSendChat = async () => {
    const message = chatInput.trim();
    if (!message || chatLoading) return;

    const userMessage = { role: "user", content: message };
    const nextMessages = [...chatMessages, userMessage];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);
    setChatError("");

    try {
      const token = localStorage.getItem("mockmind_token");
      if (!token) {
        setChatError("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      const { data } = await getChatbotHelpApi(
        {
          techStack,
          difficulty,
          languages,
          selectedQuestion: selectedQuestionForChat,
          userMessage: message,
          history: nextMessages.slice(-8)
        },
        token
      );

      const assistantReply = data?.reply || "I could not generate a response.";
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantReply }
      ]);
    } catch (error) {
      const messageText =
        error?.response?.data?.message ||
        "Unable to get AI help right now. Please try again.";
      setChatError(messageText);
    } finally {
      setChatLoading(false);
    }
  };

  const handleStartRecording = async (questionId) => {
    if (activeRecordingId && activeRecordingId !== questionId) return;
    setSubmitError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);
        setRecordings((prev) => ({
          ...prev,
          [questionId]: {
            ...(prev[questionId] || {}),
            audioUrl,
            duration: recordingSeconds
          }
        }));
        setIsUploading((prev) => ({ ...prev, [questionId]: true }));

        try {
          const token = localStorage.getItem("mockmind_token");
          const { data } = await uploadAnswerAudioApi(questionId, blob, token);
          setRecordings((prev) => ({
            ...prev,
            [questionId]: {
              ...(prev[questionId] || {}),
              transcript: data.transcript,
              fileId: data.fileId || ""
            }
          }));
        } catch (error) {
          const message =
            error?.response?.data?.message ||
            "Failed to upload audio. Please try again.";
          setSubmitError(message);
        } finally {
          setIsUploading((prev) => ({ ...prev, [questionId]: false }));
        }
      };

      mediaRecorder.start();
      setActiveRecordingId(questionId);
      setIsPaused(false);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (_error) {
      setSubmitError("Microphone access denied or unavailable.");
    }
  };

  const handlePauseRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleResumeRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    setActiveRecordingId(null);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const token = localStorage.getItem("mockmind_token");
      const answers = questions.map((question) => ({
        questionId: question.id,
        transcript: recordings[question.id]?.transcript || "",
        audioFileId:
          question.type === "Code" ? "" : recordings[question.id]?.fileId || "",
        questionText: question.text,
        questionType: question.type
      }));
      const { data } = await evaluateAnswersApi(
        {
          questions,
          answers,
          sessionMeta: {
            techStack,
            difficulty,
            languages,
            submittedAt: new Date().toISOString()
          }
        },
        token
      );
      const mapped = {};
      (data.results || []).forEach((result) => {
        mapped[result.questionId] = result;
      });
      setResults(mapped);
      setSessionScore(typeof data.score === "number" ? data.score : null);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to evaluate answers. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="practice-page">
      <header className="practice-header question-header">
        <div>
          <p className="eyebrow">Practice Session</p>
          <h1>Answer the questions below.</h1>
          <p className="practice-subtitle">
            You selected{" "}
            <strong>{stackLabel} - {difficultyLabel}</strong>
            .
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/practice/history")}
          >
            Session history
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/practice")}
          >
            Edit selections
          </button>
        </div>
      </header>

      <div className="practice-card question-summary">
        <div className="summary-row">
          <span>Tech stack</span>
          <strong>{stackLabel}</strong>
        </div>
        <div className="summary-row">
          <span>Difficulty</span>
          <strong>{difficultyLabel}</strong>
        </div>
        <div className="summary-row column">
          <span>Languages</span>
          <div className="summary-tags">
            {(languages || []).map((language) => (
              <span key={language} className="summary-tag">
                {language}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="practice-card questions-card visible">
        <h2>Question set {questionCount ? `(${questionCount})` : ""}</h2>
        <p className="subtitle">
          5 theory questions and 5 programming questions. Record a voice answer
          for theory, and type code for programming before submitting.
        </p>
        {!isLoading && !errorMessage && questionCount > 0 && (
          <p className="hint-text">
            Tip: click any question text to copy it into the chatbot at the
            right corner.
          </p>
        )}
        {isLoading && <p className="subtitle">Generating questions...</p>}
        {!isLoading && errorMessage && (
          <p className="error-text">{errorMessage}</p>
        )}
        {!isLoading && !errorMessage && (
          <div className="question-list">
            {questions.map((question, index) => (
              <div key={question.id} className="question-item">
                <div className="question-meta">
                  <span className="question-number">Q{index + 1}</span>
                  <span className="question-tag">{question.type}</span>
                </div>
                <p
                  className="question-text question-text-chat-target"
                  onClick={() => handleSelectQuestionForChat(question.text)}
                  title="Click to copy this question into chatbot"
                >
                  {question.text}
                </p>
                {question.type === "Code" ? (
                  <div className="code-answer">
                    <textarea
                      className="code-textarea"
                      rows={10}
                      spellCheck={false}
                      placeholder="Write your code here..."
                      value={recordings[question.id]?.transcript || ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setRecordings((prev) => ({
                          ...prev,
                          [question.id]: {
                            ...(prev[question.id] || {}),
                            transcript: value
                          }
                        }));
                      }}
                    />
                    {recordings[question.id]?.transcript && (
                      <span className="answer-status success">
                        Answer saved
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="answer-row">
                    <button
                      type="button"
                      className={`btn-secondary btn-inline ${
                        activeRecordingId === question.id ? "recording" : ""
                      }`}
                      onClick={() =>
                        activeRecordingId === question.id
                          ? handleStopRecording()
                          : handleStartRecording(question.id)
                      }
                      disabled={
                        (activeRecordingId &&
                          activeRecordingId !== question.id) ||
                        isUploading[question.id]
                      }
                    >
                      {activeRecordingId === question.id
                        ? "End Recording"
                        : "Start Recording"}
                    </button>
                    <button
                      type="button"
                      className="btn-outline btn-inline"
                      onClick={() =>
                        isPaused ? handleResumeRecording() : handlePauseRecording()
                      }
                      disabled={
                        activeRecordingId !== question.id ||
                        isUploading[question.id]
                      }
                    >
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                    {activeRecordingId === question.id && (
                      <span className="answer-timer">
                        {Math.floor(recordingSeconds / 60)
                          .toString()
                          .padStart(2, "0")}
                        :
                        {(recordingSeconds % 60).toString().padStart(2, "0")}
                      </span>
                    )}
                    {isUploading[question.id] && (
                      <span className="answer-status">Transcribing...</span>
                    )}
                    {!isUploading[question.id] &&
                      recordings[question.id]?.transcript && (
                        <span className="answer-status success">
                          Answer saved
                        </span>
                      )}
                  </div>
                )}
                {question.type !== "Code" &&
                  recordings[question.id]?.transcript && (
                    <p className="answer-transcript">
                      <strong>Transcript:</strong>{" "}
                      {recordings[question.id].transcript}
                    </p>
                  )}
                {results[question.id] && (
                  <div
                    className={`answer-result ${
                      results[question.id].correct ? "correct" : "wrong"
                    }`}
                  >
                    <strong>
                      {results[question.id].correct ? "Correct" : "Needs work"}
                    </strong>
                    <span>{results[question.id].feedback}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {resultsSummary && (
          <div className="practice-card session-summary">
            <div className="session-header">
              <div>
                <p className="eyebrow">Session Feedback</p>
                <h2>{resultsSummary.praise}</h2>
                <p className="subtitle">{resultsSummary.subtitle}</p>
              </div>
              <div className={`session-score ${resultsSummary.tone}`}>
                <span>Score</span>
                <strong>{resultsSummary.score}</strong>
              </div>
            </div>
            <div className="session-metrics">
              <div className="session-metric">
                <span>Correct</span>
                <strong>
                  {resultsSummary.correctCount}/{resultsSummary.totalCount}
                </strong>
              </div>
              <div className="session-metric">
                <span>Needs work</span>
                <strong>
                  {resultsSummary.totalCount - resultsSummary.correctCount}
                </strong>
              </div>
            </div>
            <div className="focus-area">
              <h3>Focus next</h3>
              {resultsSummary.weakTopics.length > 0 ? (
                <div className="focus-chips">
                  {resultsSummary.weakTopics.map((topic) => (
                    <span key={topic} className="focus-chip">
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="subtitle">
                  No weak topics detected. Keep this momentum!
                </p>
              )}
            </div>
          </div>
        )}
        {!isLoading && !errorMessage && questionCount > 0 && (
          <div className="question-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
            >
              {isSubmitting ? "Evaluating..." : "Submit Session"}
            </button>
          </div>
        )}
        {!isLoading && !errorMessage && submitError && (
          <p className="error-text">{submitError}</p>
        )}
      </section>

      {!isLoading && !errorMessage && questionCount > 0 && (
        <div className="chatbot-floating-wrap">
          {isChatOpen && (
            <div className="chatbot-panel">
              <div className="chatbot-panel-header">
                <div>
                  <p className="eyebrow">Question Assistant</p>
                  <h3>Ask any concept or doubt</h3>
                </div>
                <button
                  type="button"
                  className="chatbot-close"
                  onClick={() => setIsChatOpen(false)}
                  aria-label="Close chatbot"
                >
                  x
                </button>
              </div>
              {selectedQuestionForChat && (
                <p className="chatbot-context">
                  Selected question: <strong>{selectedQuestionForChat}</strong>{" "}
                  <button
                    type="button"
                    className="chatbot-clear"
                    onClick={() => setSelectedQuestionForChat("")}
                  >
                    Clear
                  </button>
                </p>
              )}
              <div className="chatbot-messages">
                {chatMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`chat-msg ${message.role}`}
                  >
                    <div className="chat-msg-label">
                      {message.role === "assistant" ? "AI" : "You"}
                    </div>
                    <div className="chat-msg-content">{message.content}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-msg assistant">
                    <div className="chat-msg-label">AI</div>
                    <div className="chat-msg-content">Thinking...</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="chatbot-input-row">
                <textarea
                  className="answer-box"
                  rows={3}
                  placeholder="Ask any concept (example: explain OOP, DB indexing, React hooks)..."
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary btn-inline"
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || chatLoading}
                >
                  {chatLoading ? "Sending..." : "Ask AI"}
                </button>
              </div>
              {chatError && <p className="error-text">{chatError}</p>}
            </div>
          )}
          <button
            type="button"
            className="chatbot-launcher"
            onClick={() => setIsChatOpen((prev) => !prev)}
          >
            {isChatOpen ? "Hide Assistant" : "Chat with AI"}
          </button>
        </div>
      )}
    </div>
  );
}

export default PracticeQuestionsPage;

