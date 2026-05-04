# MockMind AI-Powered Interview Simulation Platform (MERN + AI)

MockMind is a full-stack AI-enabled interview preparation platform that delivers structured interview simulations, AI evaluation, audio transcription, coding response capture, chatbot assistance, performance tracking, and an administrative analytics console.

This is not just an authentication project — it is a complete AI-driven interview simulation system.

---

# 📌 Product Highlights

* 🤖 AI-generated interview questions
* 🎤 Audio-based theory answer capture (with transcription)
* 💻 Coding answer capture (text editor based)
* 🧠 AI-powered evaluation & scoring
* 💬 In-session AI chatbot assistant
* 📊 Admin dashboard with analytics
* 🔐 JWT-based authentication (User + Admin roles)
* 📧 Email notifications (Registration, Feedback, Contact)
* 🗂 Session history tracking
* 🗄 GridFS audio storage

---

# 🏗 Tech Stack

## Frontend

* React 18
* React Router 6
* Vite
* Axios
* Recharts

## Backend

* Node.js
* Express
* Mongoose
* Express Validator
* Multer

## Database

* MongoDB
* GridFS (Audio persistence)

## Security

* JWT Authentication
* bcryptjs Password Hashing

## AI & Integrations

* Groq API (Question generation, evaluation, chatbot, transcription)
* Nodemailer (SMTP email service)

---

# 📂 Project Structure

```
MockMind/
│
├── client/               # React SPA
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│
├── server/               # Express API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│
└── README.md
```

---

# ⚙️ Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Ghinaiya-Deep/MockmMind-AI-Interview-Preparation-Platform.git
cd mockmind
```

---

# 🖥 Backend Setup

```bash
cd server
npm install
```

Create `.env` file inside `/server`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mockmind
JWT_SECRET=your_secret_key

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_model_name

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=MockMind <your_email@gmail.com>

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
ADMIN_NAME=Admin
```

Start backend:

```bash
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

# 🌐 Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔌 API Overview

Base URL:

```
/api
```

## Authentication

* POST `/auth/register`
* POST `/auth/login`
* GET `/auth/me`

## Practice Flow

* POST `/practice/questions`
* POST `/practice/answers`
* POST `/practice/evaluate`
* POST `/practice/chatbot`
* GET `/practice/sessions`

## Communication

* POST `/contact`
* POST `/feedback`

## Admin

* POST `/admin/login`
* GET `/admin/dashboard-stats`
* GET `/admin/chart-stats`
* GET `/admin/users`
* GET `/admin/feedbacks`
* DELETE `/admin/feedbacks/:id`
* GET `/admin/contacts`
* DELETE `/admin/contacts/:id`

---

# 🔐 Security Model

* Passwords hashed using bcrypt
* JWT token-based authentication
* Role-based admin access
* Protected middleware for sensitive routes
* Structured validation via Express Validator
* Audio file size limit enforced

---

# 🧠 Practice Session Flow

1. User selects tech stack, difficulty, language
2. AI generates exactly 10 structured questions
3. User records theory answers (audio)
4. Audio transcribed using AI
5. Coding answers captured as text
6. AI evaluates performance
7. Score generated
8. Session stored in MongoDB
9. User can review session history

---

# 📊 Admin Capabilities

* KPI dashboard
* Chart-based analytics
* User list monitoring
* Feedback moderation
* Contact moderation
* Delete operations

---

# 🗄 Database Collections

* users
* admins
* practicesessions
* feedbacks
* contactmessages
* GridFS: practiceAudio bucket

---

# 🚀 Future Roadmap

* Refresh token system
* Rate limiting for AI endpoints
* Automated testing (Unit + Integration + E2E)
* Advanced analytics
* Enhanced coding editor
* Deployment optimization

---

# 📈 Learning Outcomes

This project demonstrates:

* Full-stack architecture design
* AI orchestration in production workflows
* Audio + text hybrid response handling
* Role-based access control
* API design and validation
* MongoDB GridFS usage
* Real-world SaaS-style system modeling

---

# 👨‍💻 Author

**Deep Ghinaiya**
Software Developer | Web Developer | AI Builder

---

# 🌐 Connect With Me

LinkedIn: https://www.linkedin.com/in/deep-ghinaiya/ <br>
GitHub: https://github.com/Ghinaiya-Deep/ <br>
Portfolio: https://deepghinaiya.netlify.app/ <br>
ResearchGate: https://www.researchgate.net/profile/Ghinaiya-Deep/ <br>

---

# 📜 License

This project is developed for portfolio and educational purposes.
All rights reserved © Deep Ghinaiya.

---

⭐ If you found this project impressive, consider starring the repository.

---
