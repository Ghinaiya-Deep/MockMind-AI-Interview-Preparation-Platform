import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TECH_STACKS = [
  {
    id: "frontend",
    title: "Frontend Development",
    summary: "UI, UX, and client-side performance.",
  },
  {
    id: "backend",
    title: "Backend Development",
    summary: "APIs, databases, and system design.",
  },
  {
    id: "datascience",
    title: "Data Science",
    summary: "Data analysis, ML basics, and insights.",
  },
  {
    id: "mobile",
    title: "Mobile Development",
    summary: "Android, iOS, and cross-platform apps.",
  },
];

const DIFFICULTIES = [
  { id: "easy", title: "Easy", detail: "Warm-up and fundamentals." },
  { id: "medium", title: "Medium", detail: "Applied knowledge and patterns." },
  { id: "hard", title: "Hard", detail: "Challenging, interview-level depth." },
];

const LANGUAGES = [

  // Programming Languages
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "C",
  "C++",
  "C#",
  "Go",
  "PHP",
  "Kotlin",
  "Swift",
  "SQL",

  // Web Technologies
  "HTML",
  "CSS",
  "React.js",
  "Node.js",

  // Core Concepts
  "Data Structures & Algorithms",
  "OOP",

  // Databases
  "MongoDB",
  "MySQL",

];

const STACK_LANGUAGE_RULES = {
  frontend: new Set(["HTML", "CSS", "JavaScript", "TypeScript", "React.js"]),
  backend: new Set([
    "Java",
    "Python",
    "JavaScript",
    "TypeScript",
    "C#",
    "Go",
    "PHP",
    "Node.js",
    "SQL",
    "MongoDB",
    "MySQL",
  ]),
  datascience: new Set(["Python", "SQL", "MongoDB", "MySQL"]),
  mobile: new Set(["Java", "Kotlin", "Swift"]),
};

const UNIVERSAL_LANGUAGES = new Set(["Data Structures & Algorithms", "OOP"]);

function PracticeModulePage() {
  const navigate = useNavigate();
  const [techStack, setTechStack] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [languages, setLanguages] = useState([]);
  const [errors, setErrors] = useState({});

  const getStackTitle = (stackId) =>
    TECH_STACKS.find((item) => item.id === stackId)?.title || "this stack";

  const getInvalidLanguages = (stackId, selected) => {
    if (!stackId) return [];
    const allowed = STACK_LANGUAGE_RULES[stackId];
    if (!allowed) return [];
    return selected.filter(
      (language) =>
        !allowed.has(language) && !UNIVERSAL_LANGUAGES.has(language)
    );
  };

  const toggleLanguage = (language) => {
    setLanguages((prev) => {
      if (prev.includes(language)) {
        const next = prev.filter((item) => item !== language);
        const invalid = getInvalidLanguages(techStack, next);
        setErrors((current) => ({
          ...current,
          languages: invalid.length
            ? `Selected languages don't match ${getStackTitle(
                techStack
              )}: ${invalid.join(", ")}.`
            : "",
        }));
        return next;
      }
      const invalid = getInvalidLanguages(techStack, [language]);
      if (invalid.length > 0) {
        setErrors((current) => ({
          ...current,
          languages: `"${language}" doesn't match ${getStackTitle(techStack)}.`,
        }));
        return prev;
      }
      const next = [...prev, language];
      setErrors((current) => ({ ...current, languages: "" }));
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!techStack) {
      nextErrors.techStack = "Please select a tech stack.";
    }
    if (!difficulty) {
      nextErrors.difficulty = "Please choose a difficulty level.";
    }
    if (languages.length === 0) {
      nextErrors.languages = "Please select at least one language.";
    }
    const invalidLanguages = getInvalidLanguages(techStack, languages);
    if (invalidLanguages.length > 0) {
      nextErrors.languages = `Selected languages don't match ${getStackTitle(
        techStack
      )}: ${invalidLanguages.join(", ")}.`;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      navigate("/practice/questions", {
        state: {
          techStack,
          difficulty,
          languages,
        },
      });
    }
  };

  const handleStackChange = (value) => {
    setTechStack(value);
    setErrors((prev) => {
      const updated = { ...prev, techStack: "" };
      const invalidLanguages = getInvalidLanguages(value, languages);
      if (invalidLanguages.length > 0) {
        updated.languages = `Selected languages don't match ${getStackTitle(
          value
        )}: ${invalidLanguages.join(", ")}.`;
      } else if (updated.languages) {
        updated.languages = "";
      }
      return updated;
    });
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    setErrors((prev) => ({ ...prev, difficulty: "" }));
  };

  const isReady = techStack && difficulty && languages.length > 0;

  return (
    <div className="practice-page">
      <header className="practice-header">
        <div>
          <p className="eyebrow">Practice Modules</p>
          <h1>Build your interview session.</h1>
          <p className="practice-subtitle">
            Select a tech stack, difficulty, and languages before starting.
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
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="practice-grid">
        <form className="practice-card" onSubmit={handleSubmit}>
          <div className="section-title">
            <h2>Step 1: Choose a tech stack</h2>
            <p className="subtitle">
              This controls the topic area for your questions.
            </p>
          </div>
          <div className="option-grid">
            {TECH_STACKS.map((stack) => (
              <label
                key={stack.id}
                className={`option-card ${
                  techStack === stack.id ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="techStack"
                  value={stack.id}
                  checked={techStack === stack.id}
                  onChange={() => handleStackChange(stack.id)}
                />
                <span className="option-title">{stack.title}</span>
                <span className="option-detail">{stack.summary}</span>
              </label>
            ))}
          </div>
          {errors.techStack && <span className="error-text">{errors.techStack}</span>}

          <div className="section-title">
            <h2>Step 2: Select difficulty level</h2>
            <p className="subtitle">Easy, medium, or hard.</p>
          </div>
          <div className="option-grid">
            {DIFFICULTIES.map((level) => (
              <label
                key={level.id}
                className={`option-card ${
                  difficulty === level.id ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={level.id}
                  checked={difficulty === level.id}
                  onChange={() => handleDifficultyChange(level.id)}
                />
                <span className="option-title">{level.title}</span>
                <span className="option-detail">{level.detail}</span>
              </label>
            ))}
          </div>
          {errors.difficulty && (
            <span className="error-text">{errors.difficulty}</span>
          )}

          <div className="section-title">
            <h2>Step 3: Pick languages</h2>
            <p className="subtitle">
              Select all languages you want included in the practice session.
            </p>
          </div>
          <div className="chip-grid">
            {LANGUAGES.map((language) => (
              <button
                type="button"
                key={language}
                className={`chip ${languages.includes(language) ? "active" : ""}`}
                onClick={() => toggleLanguage(language)}
              >
                {language}
              </button>
            ))}
          </div>
          {errors.languages && (
            <span className="error-text">{errors.languages}</span>
          )}

          <button className="btn-primary" type="submit" disabled={!isReady}>
            Start Practice Session
          </button>
          {!isReady && (
            <p className="hint-text">
              Select a tech stack, difficulty, and at least one language.
            </p>
          )}
        </form>

        <aside className="practice-card summary-card">
          <h2>Session summary</h2>
          <div className="summary-row">
            <span>Tech stack</span>
            <strong>
              {techStack
                ? TECH_STACKS.find((item) => item.id === techStack)?.title
                : "Not selected"}
            </strong>
          </div>
          <div className="summary-row">
            <span>Difficulty</span>
            <strong>
              {difficulty
                ? DIFFICULTIES.find((item) => item.id === difficulty)?.title
                : "Not selected"}
            </strong>
          </div>
          <div className="summary-row column">
            <span>Languages</span>
            <div className="summary-tags">
              {languages.length === 0
                ? "No languages selected"
                : languages.map((language) => (
                    <span className="summary-tag" key={language}>
                      {language}
                    </span>
                  ))}
            </div>
          </div>
          <div className="summary-note">
            Questions will appear on the next page.
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PracticeModulePage;
