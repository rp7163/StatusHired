<div align="center">

# 🎯 StatusHired

**Track every job application from "saved" to "offer" — in one place.**

A full-stack job application tracker built with the **MERN stack**: drag-and-drop pipeline board, resume manager, smart reminders, real-time sync and a personal profile page.

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**[Live Demo](https://status-hired.vercel.app)** · **[Report a bug](https://github.com/rp7163/StatusHired/issues)** · **[Portfolio](https://patelrudra.vercel.app)**

</div>

---

## ✨ Features

| | |
| --- | --- |
| 📊 **Dashboard** | Pipeline stats at a glance, upcoming reminders and recent applications |
| 📋 **Applications** | Searchable, filterable list with a detail drawer and a full stage timeline per application |
| 🗂️ **Kanban board** | Drag & drop cards between *Saved → Applied → Assessment → Interview → Selected / Rejected*; every move is recorded as history |
| 📄 **Resume manager** | Upload PDFs, preview in-app, download, rename, delete and attach a resume to each application |
| ⏰ **Reminders** | Interview, take-home and follow-up reminders with snooze, bulk actions and optional browser notifications |
| 👤 **Profile page** | Dedicated page with photo, headline, bio, location, social & coding-profile links and live stats — all editable in-app |
| 🪪 **About page** | You can see developer's details |
| ⚡ **Real-time sync** | Changes appear instantly in every open tab / device |
| 🌗 **Light / dark theme** | Emerald-teal design system, persisted per user |
| 🔐 **Secure auth** | Email + password with **OTP email verification**, bcrypt-hashed passwords, JWT sessions, per-user data isolation |

---

## 🛠️ Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19 (JavaScript / JSX), Vite, Tailwind CSS v4, React Router, Lucide icons |
| Backend | Node.js, Express.js, Mongoose, JSON Web Tokens, bcrypt, Socket.io, Nodemailer |
| Database | MongoDB |
| Hosting | Vercel (client) · Render (API) · MongoDB Atlas |

---

## 📁 Project structure

```
StatusHired/
├── client/                      React app (Vite)
│   └── src/
│       ├── pages/               Dashboard, Applications, Board, Resumes, Reminders, Profile, About, Login
│       ├── components/          ui/, layout/ (Header, Footer, MobileNav), kanban, resumes, modals
│       ├── context/             Auth, Theme, JobTracker, Reminder, Search, Toast
│       ├── hooks/               useApplications, useResumes, useReminderEngine, …
│       ├── lib/                 api.js (REST client), realtime.js, storage.js, biometrics.js
│       └── data/about.js        ← edit this file to change the About page
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
├── render.yaml                  One-click Render blueprint for the API
├── start-windows.bat            Double-click launcher for Windows
└── package.json                 Root scripts (runs client + server together)
```

---

## 🗺️ Future scope

- [ ] AI resume ↔ job-description match score
- [ ] Import applications from a job URL
- [ ] Email digests of upcoming reminders
- [ ] Export to CSV / PDF

---

## 👤 Author

**Rudra Patel** — B.Tech Computer Engineering, PDEU
[Portfolio](https://patelrudra.vercel.app) · [GitHub](https://github.com/rp7163) · [LinkedIn](https://www.linkedin.com/in/rudra-patel-pdeu/)