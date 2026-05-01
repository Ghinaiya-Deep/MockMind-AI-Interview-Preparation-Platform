import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfileApi } from "../api/authApi";

const roadmapData = {
  JavaScript: {
    basic: [
      "To-do app with local storage and filters",
      "Weather dashboard using a public API",
      "Expense tracker with category charts"
    ],
    intermediate: [
      "Kanban board with drag-and-drop columns",
      "Movie discovery app with debounced search",
      "Real-time poll app with WebSocket updates"
    ],
    advanced: [
      "Micro-frontend dashboard with shared auth",
      "Offline-first PWA with sync queue",
      "Collaborative whiteboard with live cursors"
    ]
  },
  TypeScript: {
    basic: [
      "Typed quiz app with reusable components",
      "Form builder with schema-based validation",
      "Notes app with strict interface modeling"
    ],
    intermediate: [
      "REST SDK package with typed API clients",
      "Role-based admin panel with route guards",
      "State machine driven onboarding flow"
    ],
    advanced: [
      "Design system library with typed tokens",
      "Event-sourcing demo with typed commands",
      "Realtime editor with operational transforms"
    ]
  },
  Python: {
    basic: [
      "Command-line task manager with file storage",
      "Data cleaner script for CSV files",
      "Password manager CLI with encryption"
    ],
    intermediate: [
      "Flask CRUD app with authentication",
      "Web scraper with scheduler and exports",
      "FastAPI service for notes and tagging"
    ],
    advanced: [
      "Recommendation engine with implicit feedback",
      "Document Q&A pipeline with vector search",
      "Automated test platform for API contracts"
    ]
  },
  Java: {
    basic: [
      "Inventory console app using OOP",
      "Bank account simulator with transactions",
      "Student report generator with file IO"
    ],
    intermediate: [
      "Spring Boot CRUD API with MySQL",
      "Job application tracker with JWT auth",
      "Library portal using MVC architecture"
    ],
    advanced: [
      "Payment processing service with retries",
      "Distributed task processor using Kafka",
      "Secure identity service with OAuth flows"
    ]
  },
  C: {
    basic: [
      "Contact book using structures and files",
      "Matrix operations toolkit",
      "Menu-driven banking simulation"
    ],
    intermediate: [
      "Mini shell with command parsing",
      "Memory allocator simulation project",
      "File compression utility using Huffman coding"
    ],
    advanced: [
      "Threaded HTTP server in C",
      "Network packet analyzer for local traffic",
      "Custom key-value storage engine"
    ]
  },
  "C++": {
    basic: [
      "Class-based library manager",
      "Snake game in terminal",
      "Sales report analyzer using STL"
    ],
    intermediate: [
      "Pathfinding visualizer with graph algorithms",
      "Chess engine basics with move generation",
      "Image editor core with filter pipeline"
    ],
    advanced: [
      "Multithreaded order matching system",
      "Game engine module with ECS architecture",
      "Low-latency websocket client library"
    ]
  },
  "C#": {
    basic: [
      "Desktop calculator with WinForms",
      "Simple expense tracker with LINQ",
      "Quiz app with score history"
    ],
    intermediate: [
      "ASP.NET Core task API",
      "Blog platform with identity auth",
      "E-learning portal with course progress"
    ],
    advanced: [
      "CQRS-based backend with MediatR",
      "Realtime dashboard using SignalR",
      "Cloud-ready microservice suite on .NET"
    ]
  },
  Go: {
    basic: [
      "CLI URL shortener",
      "File backup utility with config",
      "Concurrent worker pool demo"
    ],
    intermediate: [
      "REST API with PostgreSQL and migrations",
      "Log aggregation service with channels",
      "JWT auth service with refresh tokens"
    ],
    advanced: [
      "gRPC service mesh sample",
      "Distributed job scheduler with retries",
      "High-throughput event ingestion pipeline"
    ]
  },
  Rust: {
    basic: [
      "CLI habit tracker with serde",
      "Password strength analyzer",
      "Markdown to HTML converter"
    ],
    intermediate: [
      "Actix web API with Postgres",
      "Concurrent file indexer",
      "Terminal chat app with async runtime"
    ],
    advanced: [
      "Streaming parser for large datasets",
      "Zero-copy message broker prototype",
      "WASM-based image transformation module"
    ]
  },
  PHP: {
    basic: [
      "Student result management system",
      "Contact form with server-side validation",
      "Session-based login mini app"
    ],
    intermediate: [
      "Laravel CRUD project with policies",
      "Invoice management app with exports",
      "CMS-style article platform"
    ],
    advanced: [
      "Multi-tenant SaaS starter in Laravel",
      "Event-driven notification service",
      "API gateway with rate limiting"
    ]
  },
  Ruby: {
    basic: [
      "Command-line diary app",
      "Budget calculator with file persistence",
      "URL checker utility"
    ],
    intermediate: [
      "Rails blog with comments and likes",
      "Issue tracker with background jobs",
      "Booking app with calendar support"
    ],
    advanced: [
      "Rails API with GraphQL",
      "Scalable job processing pipeline",
      "Marketplace platform with payments"
    ]
  },
  Kotlin: {
    basic: [
      "Unit converter Android app",
      "Notes app with Room database",
      "Habit streak tracker"
    ],
    intermediate: [
      "Weather app with clean architecture",
      "Chat UI with Firebase backend",
      "Expense planner with analytics"
    ],
    advanced: [
      "Offline-first ecommerce mobile app",
      "Modular Android app with feature flags",
      "Realtime collaboration app with sync engine"
    ]
  },
  Swift: {
    basic: [
      "iOS to-do app with local persistence",
      "BMI and health tracker",
      "Flashcard app with spaced repetition"
    ],
    intermediate: [
      "News app using MVVM + Combine",
      "Travel planner with map integration",
      "Recipe app with favorites and search"
    ],
    advanced: [
      "ARKit based indoor navigation demo",
      "Realtime voice notes sync app",
      "Modular iOS architecture with Swift packages"
    ]
  },
  SQL: {
    basic: [
      "Design schema for a school database",
      "Write reporting queries for sales KPIs",
      "Create views for reusable analytics"
    ],
    intermediate: [
      "Build stored procedures for billing",
      "Optimize slow joins with indexing",
      "Design audit logging with triggers"
    ],
    advanced: [
      "Warehouse modeling with star schema",
      "Incremental ETL pipeline with CDC",
      "Data quality framework with test queries"
    ]
  },
  Dart: {
    basic: [
      "Console calculator with unit tests",
      "Task scheduler with JSON storage",
      "Chat message formatter package"
    ],
    intermediate: [
      "Flutter attendance tracker app",
      "Recipe explorer with API integration",
      "Personal finance app with charts"
    ],
    advanced: [
      "Flutter app with offline sync architecture",
      "Scalable state management with feature modules",
      "Cross-platform productivity suite"
    ]
  }
};

const levels = [
  { key: "basic", title: "Basic", subtitle: "Build fundamentals and confidence" },
  {
    key: "intermediate",
    title: "Intermediate",
    subtitle: "Strengthen architecture and implementation"
  },
  {
    key: "advanced",
    title: "Advanced",
    subtitle: "Deliver production-style systems"
  }
];

function RoadmapPage() {
  const [name, setName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("mockmind_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const { data } = await getProfileApi(token);
        setName(data.user.name || "");
      } catch (_error) {
        localStorage.removeItem("mockmind_token");
        localStorage.removeItem("mockmind_user");
        navigate("/login");
      }
    };

    loadProfile();
  }, [navigate]);

  const languageList = useMemo(() => Object.keys(roadmapData), []);

  return (
    <div className="roadmap-page">
      <div className="roadmap-shell">
        <header className="roadmap-header">
          <div>
            <p className="eyebrow">Skill Roadmap</p>
            <h1>Build Your Language Growth Plan</h1>
            <p className="roadmap-lead">
              Choose a language, follow level-wise projects, and keep improving
              from basics to advanced production work.
            </p>
          </div>
          <div className="roadmap-header-actions">
            <span className="roadmap-user">
              {name ? `Hi, ${name}` : "Hi, Learner"}
            </span>
            <button
              className="btn-outline btn-inline"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </header>

        <section className="roadmap-picker-card">
          <h2>Select Programming Language ({languageList.length})</h2>
          <div className="roadmap-language-grid">
            {languageList.map((language) => (
              <button
                key={language}
                type="button"
                className={
                  selectedLanguage === language
                    ? "roadmap-language active"
                    : "roadmap-language"
                }
                onClick={() => setSelectedLanguage(language)}
              >
                {language}
              </button>
            ))}
          </div>
        </section>

        <section className="roadmap-plan">
          <div className="roadmap-plan-title">
            <h2>{selectedLanguage} Project Path</h2>
            <p>Start with Basic, then Intermediate, then Advanced.</p>
          </div>
          <div className="roadmap-level-grid">
            {levels.map((level) => (
              <article className="roadmap-level-card" key={level.key}>
                <h3>{level.title}</h3>
                <p>{level.subtitle}</p>
                <ul>
                  {roadmapData[selectedLanguage][level.key].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RoadmapPage;
