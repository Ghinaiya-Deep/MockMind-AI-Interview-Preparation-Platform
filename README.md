# MockMind Full Stack Auth Project (MERN)

This project includes:

- React.js frontend (Register + Login pages)
- Node.js + Express backend API
- MongoDB (MongoDB Compass compatible)
- Email on successful registration ("Thanks for registering")
- Form validation (frontend + backend)
- Clean, modern UI theme

## Project Structure

```text
MockMind/
  client/   -> React app
  server/   -> Express API
```

## 1) Backend Setup

```bash
cd server
npm install
```

Create `.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mockmind
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=deep.c617.app@gmail.com
EMAIL_PASS=khkc cfft prig jiuz
EMAIL_FROM=MockMind <your_email@gmail.com>
```

Run backend:

```bash
npm run dev
```

## 2) Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)

## MongoDB Compass

Use connection string:

```text
mongodb://127.0.0.1:27017
```

Database name used by this project: `mockmind`.
