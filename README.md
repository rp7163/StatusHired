# 🎯 StatusHired

**Track every job application from "saved" to "offer" — in one place.**

StatusHired is a full-stack job application tracker built with the **MERN stack**. It has a drag-and-drop pipeline board, a resume manager, smart reminders, real-time sync and a personal profile page.

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**[Live Demo](https://status-hired.vercel.app)** · **[Report a bug](https://github.com/rp7163/StatusHired/issues)** · **[Portfolio](https://patelrudra.vercel.app)**

---

## 📌 Project Description

Job hunting means juggling dozens of applications, resumes, interviews and follow-ups. StatusHired puts all of it in one dashboard. Each application moves through a clear pipeline (Saved → Applied → Assessment → Interview → Selected / Rejected), and every stage change is recorded as history. Each user's data is private to their account.

---

## ✨ Features

| Feature | Description |
| --- | --- |
| 📊 **Dashboard** | Pipeline stats at a glance, upcoming reminders and recent applications |
| 📋 **Applications** | Searchable, filterable list with a detail drawer and a full stage timeline per application |
| 🗂️ **Kanban board** | Drag and drop cards between *Saved → Applied → Assessment → Interview → Selected / Rejected*; every move is recorded as history |
| 📄 **Resume manager** | Upload PDFs, preview in-app, download, rename, delete and attach a resume to each application |
| ⏰ **Reminders** | Interview, take-home and follow-up reminders with snooze, bulk actions and optional browser notifications |
| 👤 **Profile page** | Photo, headline, bio, location, social and coding-profile links and live stats, all editable in-app |
| 🪪 **About page** | Developer details |
| ⚡ **Real-time sync** | Changes appear instantly in every open tab or device |
| 🌗 **Light / dark theme** | Emerald-teal design system, persisted per user |
| 🔐 **Secure auth** | Email + password with OTP email verification, bcrypt-hashed passwords, JWT sessions and per-user data isolation |

---

## 🛠️ Technologies Used

| Layer | Technologies |
| --- | --- |
| Frontend | React 19 (JavaScript / JSX), Vite, Tailwind CSS v4, React Router, Lucide icons |
| Backend | Node.js, Express.js, Mongoose, JSON Web Tokens, bcrypt, Socket.io, Nodemailer |
| Database | MongoDB (MongoDB Atlas in production, GridFS for file storage) |
| Testing | Custom API test suite, Playwright end-to-end tests |
| Hosting | Vercel (client) · Render (API) · MongoDB Atlas (database) |
| AI Tool | Kiro |

---

## 📁 Project Structure

```
StatusHired/
├── client/                      React app (Vite)
│   └── src/
│       ├── pages/               Dashboard, Applications, Board, Resumes, Reminders, Profile, About, Login
│       ├── components/          ui/, layout/ (Header, Footer, MobileNav), kanban, resumes, modals
│       ├── context/             Auth, Theme, JobTracker, Reminder, Search, Toast
│       ├── hooks/               useApplications, useResumes, useReminderEngine, …
│       ├── lib/                 api.js (REST client), realtime.js, storage.js, biometrics.js
│       └── data/about.js        About page content
├── server/                      Express API
│   └── src/
│       ├── index.js             App bootstrap, CORS, routes, static serving in production
│       ├── config/db.js         Mongoose connection (+ optional in-memory MongoDB for demos)
│       ├── models/              User, UserSettings, Application, Resume, Reminder, StageHistory
│       ├── routes/              auth, users, applications, resumes, reminders, settings, stageHistory
│       ├── middleware/          JWT auth, error handler
│       ├── utils/               mailer, otpStore, realtime, fileStore (GridFS / disk)
│       └── seed.js              Demo account + sample data
├── tests/                       api.test.mjs (every endpoint) · e2e.mjs (every page, in a browser)
├── render.yaml                  Render blueprint for the API
├── start-windows.bat            Double-click launcher for Windows
└── package.json                 Root scripts (runs client + server together)
```

---

## ⚙️ Setup and Installation

### Prerequisites

- Node.js 18 or higher
- npm
- A MongoDB database: a local MongoDB instance or a free MongoDB Atlas cluster

### 1. Clone the repository

```bash
git clone https://github.com/rp7163/StatusHired.git
cd StatusHired
```

### 2. Install all dependencies

```bash
npm run install:all
```

This installs the root, `server` and `client` dependencies in one command.

### 3. Configure environment variables

Create a file named `.env` inside the `server` folder with the following content:

```env
NODE_ENV=development
USE_MEMORY_DB=false
MONGODB_URI=mongodb://127.0.0.1:27017/statushired
JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=30d
FILE_STORAGE=gridfs
SEED_DEMO=false
EXPOSE_DEV_OTP=true
GMAIL_USER=your-gmail-address
GMAIL_APP_PASSWORD=your-gmail-app-password
```

Notes:

- To use MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.
- `GMAIL_USER` and `GMAIL_APP_PASSWORD` are used by Nodemailer to send OTP verification emails.
- `USE_MEMORY_DB=true` runs the app on an in-memory MongoDB for quick demos with no database setup. Data is lost when the server stops.

---

## ▶️ How to Run the Application

### Run client and server together (development)

```bash
npm run dev
```

This starts the Express API and the Vite React app at the same time. Open the local URL printed by Vite in the terminal.

### Run each part separately

```bash
npm run dev:server
npm run dev:client
```

### Production build

```bash
npm run build
npm start
```

### Seed demo data (optional)

```bash
npm run seed
```

### Windows shortcut

Double-click `start-windows.bat`.

### Run the tests

With the app running:

```bash
npm run test:api
npm run test:install
npm run test:e2e
```

---

## 🚀 Deployment

- **Client:** Vercel
- **API:** Render, configured through `render.yaml`
- **Database and file storage:** MongoDB Atlas (files are stored in GridFS so they survive redeploys)

Live app: https://status-hired.vercel.app

---

## 🤖 AI Tool Used

**Kiro**

---

## 🧠 AI Development Experience

I used Kiro as my AI development tool across the whole project, from planning to deployment. It was most valuable for debugging and configuration problems, where I used it to trace the cause of an issue, understand it, and then verify the fix myself.

### Specific tasks where I used Kiro

1. **Project planning and structure:** Planning the MERN architecture, the folder layout, and the split between the React client and the Express API.
2. **Debugging:** Finding and fixing bugs that came up while building the frontend and backend features.
3. **Database integration:** Resolving MongoDB configuration and connection issues between the Express API and MongoDB.
4. **Deployment connection fix:** The frontend and backend worked perfectly locally, but after deploying the client on Vercel they could not connect, so signup failed. I used Kiro to diagnose the frontend-backend connection configuration and fix it, and signup now works on the live app.
5. **Configuration and environment setup:** Setting up the environment and deployment configuration for the client, the API and the database.

---

## 🗺️ Future Scope

- [ ] AI resume ↔ job-description match score
- [ ] Import applications from a job URL
- [ ] Email digests of upcoming reminders
- [ ] Export to CSV / PDF

---

## 👤 Author

**Rudra Patel**, B.Tech Computer Engineering, PDEU

[Portfolio](https://patelrudra.vercel.app) · [GitHub](https://github.com/rp7163) · [LinkedIn](https://www.linkedin.com/in/rudra-patel-pdeu/)