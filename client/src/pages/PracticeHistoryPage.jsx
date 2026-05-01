import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPracticeSessionsApi } from "../api/practiceApi";

function PracticeHistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadSessions = async () => {
      const token = localStorage.getItem("mockmind_token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const { data } = await getPracticeSessionsApi(token);
        setSessions(Array.isArray(data.sessions) ? data.sessions : []);
      } catch (_error) {
        setSessions([]);
      }
    };

    loadSessions();
  }, [navigate]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
    );
  }, [sessions]);

  const formatDate = (value) => {
    if (!value) return "Unknown date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleString();
  };

  return (
    <div className="practice-page">
      <header className="practice-header">
        <div>
          <p className="eyebrow">Session History</p>
          <h1>Review previous interview sessions.</h1>
          <p className="practice-subtitle">
            Track your answers, spot patterns, and revisit feedback.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/practice")}
          >
            New session
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {sortedSessions.length === 0 ? (
        <div className="practice-card history-empty">
          <h2>No sessions yet</h2>
          <p className="subtitle">
            Complete a practice session and your answers will appear here.
          </p>
          <button
            type="button"
            className="btn-primary btn-inline"
            onClick={() => navigate("/practice")}
          >
            Start practice
          </button>
        </div>
      ) : (
        <div className="history-list">
          {sortedSessions.map((session) => {
            const score =
              typeof session.score === "number" ? session.score : "Pending";
            const resultsMap = (session.results || []).reduce((acc, result) => {
              acc[result.questionId] = result;
              return acc;
            }, {});
            const sessionId = session.id || session._id;
            const isExpanded = expandedId === sessionId;
            return (
              <div key={sessionId} className="practice-card history-card">
                <div className="history-header">
                  <div>
                    <h2>{formatDate(session.submittedAt)}</h2>
                    <div className="history-meta">
                      <span>{session.techStack || "General"}</span>
                      <span>{session.difficulty || "Mixed"}</span>
                    </div>
                    <div className="history-tags">
                      {(session.languages || []).map((language) => (
                        <span key={language} className="summary-tag">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="history-actions">
                    <div className="session-score strong">
                      <span>Score</span>
                      <strong>{score}</strong>
                    </div>
                    <button
                      type="button"
                      className="btn-outline btn-inline"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : sessionId)
                      }
                    >
                      {isExpanded ? "Hide details" : "View details"}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="qa-list">
                    {(session.questions || []).map((question, index) => {
                      const answer = (session.answers || []).find(
                        (item) => item.questionId === question.id
                      );
                      const result = resultsMap[question.id];
                      const status = result?.correct ? "Correct" : "Needs work";
                      return (
                        <div key={question.id} className="qa-item">
                          <div className="qa-header">
                            <span className="question-number">
                              Q{index + 1}
                            </span>
                            <span className="question-tag">
                              {question.type || "Theory"}
                            </span>
                            <span
                              className={`qa-status ${
                                result?.correct ? "correct" : "wrong"
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                          <p className="question-text">{question.text}</p>
                          <div className="qa-answer">
                            <strong>Answer:</strong>{" "}
                            {answer?.transcript || "No answer saved."}
                          </div>
                          {result?.feedback && (
                            <div className="qa-feedback">
                              <strong>Feedback:</strong> {result.feedback}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PracticeHistoryPage;
