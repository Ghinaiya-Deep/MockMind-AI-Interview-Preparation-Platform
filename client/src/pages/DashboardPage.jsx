import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfileApi } from "../api/authApi";
import { sendContactMessageApi } from "../api/contactApi";
import { sendFeedbackApi } from "../api/feedbackApi";

function DashboardPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactStatus, setContactStatus] = useState(null);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackImprovement, setFeedbackImprovement] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState(null);
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
        setName(data.user.name);
        setEmail(data.user.email);
        setContactName(data.user.name || "");
        setContactEmail(data.user.email || "");
        setFeedbackName(data.user.name || "");
        setFeedbackEmail(data.user.email || "");
      } catch (_error) {
        localStorage.removeItem("mockmind_token");
        localStorage.removeItem("mockmind_user");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("mockmind_token");
    localStorage.removeItem("mockmind_user");
    navigate("/login");
  };

  const handleContactSubmit = (event) => {
    event.preventDefault();
    setContactStatus(null);
    const token = localStorage.getItem("mockmind_token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactStatus({
        type: "error",
        message: "Please fill out all contact fields."
      });
      return;
    }

    const payload = {
      name: contactName.trim(),
      email: contactEmail.trim(),
      message: contactMessage.trim()
    };

    sendContactMessageApi(payload, token)
      .then(({ data }) => {
        setContactStatus({
          type: "success",
          message: data?.message || "Message sent successfully."
        });
        setContactMessage("");
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.msg ||
          error?.response?.data?.errors?.[0]?.message ||
          "Unable to send message right now.";
        setContactStatus({ type: "error", message });
      });
  };

  const handleFeedbackSubmit = (event) => {
    event.preventDefault();
    setFeedbackStatus(null);
    const token = localStorage.getItem("mockmind_token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (
      !feedbackName.trim() ||
      !feedbackEmail.trim() ||
      !feedbackImprovement.trim() ||
      !feedbackRating
    ) {
      setFeedbackStatus({
        type: "error",
        message: "Please fill out all feedback fields and choose a star rating."
      });
      return;
    }

    const payload = {
      name: feedbackName.trim(),
      email: feedbackEmail.trim(),
      rating: Number(feedbackRating),
      improvement: feedbackImprovement.trim()
    };

    sendFeedbackApi(payload, token)
      .then(({ data }) => {
        const referenceText = data?.referenceId ? ` Ref: ${data.referenceId}` : "";
        setFeedbackStatus({
          type: "success",
          message: `${data?.message || "Feedback sent successfully."}${referenceText}`
        });
        setFeedbackImprovement("");
        setFeedbackRating(0);
      })
      .catch((error) => {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.msg ||
          error?.response?.data?.errors?.[0]?.message ||
          "Unable to send feedback right now.";
        setFeedbackStatus({ type: "error", message });
      });
  };

  if (isLoading) {
    return (
      <div className="page-wrap">
        <div className="card dashboard-card">
          <h2>Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <img
            src="src/image/Interview.png"
            alt="MockMind logo"
            className="brand-logo"
            width="40"
            height="40"
          />
          <div>
            <p className="brand-title">MockMind</p>
            <p className="brand-tag">
              Interview practice with real-time guidance.
            </p>
          </div>
        </div>

        <nav className="topnav">
          <a href="#intro">About Us</a>
          <a href="#useful">Why Useful</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#feedback">Feedback</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="profile-menu">
          <button
            className="profile-avatar"
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-expanded={isProfileOpen}
            aria-label="Open profile menu"
          >
            {name ? name.charAt(0).toUpperCase() : "U"}
          </button>
          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <span className="profile-name">{name}</span>
                <span className="profile-email">{email}</span>
              </div>
              <button onClick={logout} className="btn-ghost" type="button">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="dashboard-main">
        <section id="intro" className="hero">
          <div className="hero-content">
            <p className="eyebrow">Welcome back</p>
            <h1>Turn interview anxiety into confident answers.</h1>
            <p className="lead">
              MockMind simulates real interview environments so you can practice
              anytime. Get structured feedback, master common questions, and
              walk into interviews prepared.
            </p>
            <div className="hero-actions">
              <button
                className="btn-primary btn-inline"
                type="button"
                onClick={() => navigate("/practice")}
              >
                Explore Practice Modules
              </button>
              <button
                className="btn-outline btn-inline"
                type="button"
                onClick={() => navigate("/roadmap")}
              >
                View Roadmap
              </button>
            </div>
            <div className="hero-metrics">
              <div>
                <h3>120+</h3>
                <p>Question prompts</p>
              </div>
              <div>
                <h3>Real-time</h3>
                <p>Feedback loops</p>
              </div>
              <div>
                <h3>Focused</h3>
                <p>Role-based tracks</p>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <h2>How it works</h2>
            <ol>
              <li>Pick a role and difficulty level.</li>
              <li>Answer timed questions with live prompts.</li>
              <li>Review strengths and improvement tips.</li>
            </ol>
            <div className="hero-note">
              Next: we will enable the interview practice session once this
              homepage is approved.
            </div>
          </div>
        </section>

        <section id="useful" className="section">
          <div className="section-title">
            <p className="eyebrow">Why MockMind</p>
            <h2>Designed to make practice actually useful.</h2>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Structured practice</h3>
              <p>Follow curated tracks that mirror real interview pipelines.</p>
            </div>
            <div className="feature-card">
              <h3>Instant feedback</h3>
              <p>Know exactly what to improve after every response.</p>
            </div>
            <div className="feature-card">
              <h3>Confidence tracking</h3>
              <p>Measure progress across communication, clarity, and depth.</p>
            </div>
            <div className="feature-card">
              <h3>Anytime access</h3>
              <p>Practice on your own schedule with short focused sessions.</p>
            </div>
          </div>
        </section>

        <section id="testimonials" className="section">
          <div className="section-title">
            <p className="eyebrow">Proof</p>
            <h2>What learners are saying.</h2>
          </div>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <p>
                “MockMind helped me spot filler words and refine my answers in
                one week.”
              </p>
              <span>- Aditi, Frontend Developer</span>
            </div>
            <div className="testimonial-card">
              <p>
                “The structure made me feel like I was in a real interview,
                minus the stress.”
              </p>
              <span>- Rohit, Data Analyst</span>
            </div>
            <div className="testimonial-card">
              <p>
                “Live prompts and tips were exactly what I needed before my
                campus placement.”
              </p>
              <span>- Neha, Final Year Student</span>
            </div>
          </div>
        </section>

        <section id="feedback" className="section feedback-section">
          <div className="section-title">
            <p className="eyebrow">Feedback</p>
            <h2>Help us improve your MockMind experience.</h2>
          </div>
          <div className="feedback-grid">
            <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="feedbackName">Full name</label>
                  <input
                    id="feedbackName"
                    className="input"
                    type="text"
                    placeholder="Your name"
                    value={feedbackName}
                    onChange={(event) => setFeedbackName(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="feedbackEmail">Email</label>
                  <input
                    id="feedbackEmail"
                    className="input"
                    type="email"
                    placeholder="you@email.com"
                    value={feedbackEmail}
                    onChange={(event) => setFeedbackEmail(event.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Rating</label>
                <div className="star-rating" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${feedbackRating >= star ? "active" : ""}`}
                      onClick={() => setFeedbackRating(star)}
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-caption">
                    {feedbackRating ? `${feedbackRating}/5 selected` : "Choose rating"}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="feedbackImprovement">Improvement</label>
                <textarea
                  id="feedbackImprovement"
                  className="input input-textarea"
                  rows="4"
                  placeholder="What can we improve in your dashboard journey?"
                  value={feedbackImprovement}
                  onChange={(event) => setFeedbackImprovement(event.target.value)}
                ></textarea>
              </div>
              {feedbackStatus && (
                <p
                  className={
                    feedbackStatus.type === "error" ? "error-text" : "success-text"
                  }
                >
                  {feedbackStatus.message}
                </p>
              )}
              <button className="btn-primary btn-inline" type="submit">
                Submit feedback
              </button>
            </form>
            <div className="feedback-copy-card">
              <h3>What happens after submit?</h3>
              <ul className="feedback-points">
                <li>Your feedback is saved securely.</li>
                <li>A confirmation copy is sent to your email.</li>
                <li>You receive a unique reference ID for follow-up.</li>
              </ul>
              <p className="feedback-note">
                We review every feedback entry to improve practice quality and
                dashboard experience.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="section-title">
            <p className="eyebrow">Contact Us</p>
            <h2>Let us know how we can help.</h2>
          </div>
          <div className="contact-grid">
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label htmlFor="contactName">Full name</label>
                <input
                  id="contactName"
                  className="input"
                  type="text"
                  placeholder="Your name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Email</label>
                <input
                  id="contactEmail"
                  className="input"
                  type="email"
                  placeholder="you@email.com"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactMessage">Message</label>
                <textarea
                  id="contactMessage"
                  className="input input-textarea"
                  rows="4"
                  placeholder="Tell us what you need"
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                ></textarea>
              </div>
              {contactStatus && (
                <p
                  className={
                    contactStatus.type === "error"
                      ? "error-text"
                      : "success-text"
                  }
                >
                  {contactStatus.message}
                </p>
              )}
              <button className="btn-primary btn-inline" type="submit">
                Send message
              </button>
            </form>
            <div className="contact-info">
              <div>
                <h3>Reach us</h3>
                <p>Email: deep.c617.app@gmail.com</p>
                <p>Mon - Sat, 10:00 AM - 7:00 PM</p>
              </div>
              <div>
                <h3>Support promise</h3>
                <p>We reply within 24 hours with a clear next step for you.</p>
              </div>
              <div>
                <div className="mt-4 text-sm text-gray-500">
                  <b>©</b> {new Date().getFullYear()} MockMind. All Rights
                  Reserved. <br />
                  <br />
                  <b>Developed by Deep Ghinaiya</b>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
