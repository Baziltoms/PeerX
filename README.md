# PeerX - Academic Management, P2P Skill Exchange & Industry Recruitment Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2F%20In--Memory-brightgreen.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

PeerX is an enterprise-grade full-stack platform designed to bridge institutional academic operations, peer-to-peer knowledge sharing, and direct corporate recruitment into a unified multi-tenant ecosystem.

---

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Project Structure](#project-structure)
6. [Environment Configuration](#environment-configuration)
7. [Installation & Setup](#installation--setup)
8. [Running the Application](#running-the-application)
9. [Database Seeding & Demo Accounts](#database-seeding--demo-accounts)
10. [Running Automated Tests](#running-automated-tests)
11. [Production Build](#production-build)
12. [API Endpoints Overview](#api-endpoints-overview)
13. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## Overview & Architecture

PeerX provides a role-based environment serving four primary user personas:
1. **Institution Administrators**: Multi-college tenancy, department governance, curriculum creation, faculty and student onboarding, circulars, and analytics.
2. **Faculty Members & Faculty Advisors (FA)**: Subject allocations, timetable scheduling, class attendance logging, syllabus notes/video distribution, assignment evaluation, and internal examination marks.
3. **Students**: Attendance monitoring, assignment submissions, internal marks tracking, P2P skill exchanges, live peer study rooms, and an automated portfolio/resume builder.
4. **Corporate Recruiters**: Talent search filtering, candidate skill matching (explainable Match Score), recruitment pipeline management, and campus job drives.

### System Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (Vite + React 18)             │
│                      http://localhost:5173                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Proxy (/api, /uploads)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express API Server                       │
│                      http://localhost:5001                  │
├──────────────────────────────┬──────────────────────────────┤
│  Authentication & RBAC       │  P2P Skill Exchange Engine   │
│  Academic Timetable/Attendance│  AI Campus Assistant        │
│  Resume & Candidate Match    │  Static File Storage (Multer)│
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
     [MongoDB Local / Atlas]       [Embedded In-Memory DB]
   mongodb://localhost:27017/peerx   (Zero-config fallback)
```

---

## Key Features

- **Multi-Tenant Institution Structure**: Supports multiple colleges (e.g., SNGCE, SCMS) with complete isolation of students, faculty, departments, and course curricula.
- **Timetable & Attendance Matrix**: Strict timetable verification preventing unauthorized attendance entries; automated real-time student attendance percentages.
- **P2P Skill Exchange Engine**: Interactive student-created courses with modular lessons, dynamic learning materials, mid-term gating evaluations, quizzes, and tutor rankings.
- **Peer Study Rooms**: Real-time collaborative rooms with live chat, student presence indicators, and external video meeting links (Google Meet, Zoom).
- **Grounded AI Campus Assistant**: Institutional assistant answering queries on student attendance, upcoming assignments, and daily timetable schedules without hallucination.
- **AI-Powered Resume Builder**: Dynamically builds clean, ATS-friendly resumes aggregating verified institutional academic metrics and peer skills.
- **Corporate Talent Discovery**: Multi-parameter search and matching algorithm scoring students based on CGPA, skills, coursework, and course graduation year.

---

## Tech Stack

### Frontend (`client/`)
- **Framework**: React 18 (SPA)
- **Bundler & Dev Server**: Vite 6
- **Routing**: React Router DOM 6
- **Styling**: Tailwind CSS, PostCSS, Lucide React icons
- **State Management**: React Context (`AuthContext`)

### Backend (`server/`)
- **Runtime**: Node.js (ES Modules, `type: "module"`)
- **Framework**: Express 4
- **Database**: MongoDB via Mongoose 8
- **In-Memory Fallback**: `mongodb-memory-server` (runs out-of-the-box without external database installation)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **File Uploads**: `multer` (documents, PDFs, slides, and multimedia up to 100MB)

### Testing
- **Test Runner**: Node.js Native Test Runner (`node:test`, `node:assert/strict`)
- **Integration HTTP Testing**: `supertest`

---

## Prerequisites

Before starting, ensure your system has the following installed:

- **Node.js**: v18.0.0 or later (v20+ or v22+ recommended; verified on Node v26)
- **npm**: v9.0.0 or later
- **MongoDB** *(Optional)*: A local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas URI. If MongoDB is not running locally, PeerX **automatically initializes an embedded in-memory MongoDB database** so you can develop immediately without installing MongoDB.

To verify your Node and npm versions:
```bash
node -v
npm -v
```

---

## Project Structure

```
peerx/
├── package.json              # Root package orchestrating client and server scripts
├── package-lock.json
├── README.md
├── client/                   # Vite + React Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js        # Vite dev server configuration & API proxy
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx           # Main routing & RoleRoute protection
│       ├── main.jsx          # Entrypoint & providers
│       ├── context/          # AuthContext & global states
│       ├── layouts/          # DashboardLayout & navigational sidebars
│       ├── pages/            # Admin, Faculty, Student, and Company page modules
│       ├── services/         # API client & HTTP abstractions
│       └── components/       # Reusable UI widgets, modals, and badges
└── server/                   # Node.js + Express Backend
    ├── package.json
    ├── .env                  # Environment variables
    ├── .env.example          # Template for environment variables
    ├── uploads/              # Local disk storage for uploads
    ├── tests/
    │   └── peerx.test.js     # End-to-end integration test suite
    └── src/
        ├── app.js            # Express application configuration & routes
        ├── server.js         # HTTP server entrypoint, port binding & auto-seed
        ├── config/
        │   └── db.js         # MongoDB connection with in-memory fallback
        ├── controllers/      # Request handlers for auth, admin, faculty, etc.
        ├── middleware/       # JWT auth, role validation, file upload, error handler
        ├── models/           # Mongoose schemas (User, Institution, Attendance, etc.)
        ├── routes/           # REST API routes
        ├── seed/
        │   └── seed.js       # Multi-college demographic seed generator
        └── services/         # Business logic (AI assistant, resume builder, etc.)
```

---

## Environment Configuration

The backend reads configuration settings from `server/.env`. A pre-configured `.env` is included in the project, and a template is maintained in `server/.env.example`.

### Backend Configuration (`server/.env`)

Create or update `server/.env`:

```env
# Server Port
PORT=5001

# Application Environment (development | production | test)
NODE_ENV=development

# MongoDB Connection String
# Use your local MongoDB or MongoDB Atlas URI
MONGODB_URI=mongodb://localhost:27017/peerx

# JWT Secret & Expiration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Frontend Client Origin (for CORS)
CLIENT_URL=http://localhost:5173

# Embedded In-Memory MongoDB Fallback (true | false)
# When set to true, starts an in-memory MongoDB server if the external MongoDB connection fails
ENABLE_MEMORY_DB=true
```

### Frontend Configuration (`client/vite.config.js`)

The client automatically proxies requests directed to `/api` and `/uploads` to the backend server running on `http://localhost:5001`. No additional client `.env` file is required for local development.

---

## Installation & Setup

You can set up the entire workspace with a single command from the project root directory:

```bash
# 1. Clone repository (if not already cloned)
git clone <repository-url>
cd peerx

# 2. Install all dependencies across root, server, and client
npm run install:all
```

*Alternatively, if installing dependencies manually:*
```bash
# Install root orchestration packages
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
cd ..
```

---

## Running the Application

### 1. Concurrent Development Mode (Recommended)

Run both the backend API server and frontend client concurrently with a single command:

```bash
npm run dev
```

This starts:
- **Express API Server** at: `http://localhost:5001`
- **Vite React Client** at: `http://localhost:5173`

Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.

---

### 2. Running Services Individually

If you prefer to run services in separate terminal windows:

#### Terminal 1 — Backend Server:
```bash
# From project root
npm run dev:server

# Or from server directory
cd server
npm run dev
```

#### Terminal 2 — Frontend Client:
```bash
# From project root
npm run dev:client

# Or from client directory
cd client
npm run dev
```

---

## Database Seeding & Demo Accounts

### Automatic Seeding
When starting the server (`npm run dev` or `npm run start:server`), the system checks if any user accounts exist. If the database is empty (e.g. running for the first time or using the in-memory database), **it automatically seeds the multi-college dataset**.

### Manual Seeding
To manually reset and re-seed the database at any time, run:

```bash
npm run seed
```
*(or `npm run seed --prefix server`)*

---

### Pre-Configured Demo Credentials

The seeded dataset provisions two full colleges (**SNGCE** and **SCMS**) complete with departments, faculty members, students, timetables, attendance history, assignments, and peer skill courses.

> **Default Password for All Seeded College Accounts**: provided separately  
> *(Test suite password aliases are provided separately).*

| Role | Name / Description | Email | Password | Assigned College / Dept |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | SNGCE Admin | `sngce@gmail.com` *(or `admin@sngce.edu`)* | provided separately | SNGCE College |
| **Admin** | SCMS Admin | `scms@gmail.com` | provided separately | SCMS College |
| **Faculty** | Dr. Sandhya R *(MCA HOD)* | `sandhya@gmail.com` *(or `faculty@sngce.edu`)* | provided separately | SNGCE - MCA |
| **Faculty** | Sandhya C *(MCA S2 Advisor)* | `sandhyac@gmail.com` | provided separately | SNGCE - MCA |
| **Faculty** | Jisha Abraham *(MCA S3 Advisor)*| `jisha@gmail.com` *(or `faculty2@sngce.edu`)* | provided separately | SNGCE - MCA |
| **Faculty** | Dr. Anoopkumar M | `anoopkumar@gmail.com` | provided separately | SNGCE - MCA |
| **Faculty** | Dr. M. K. Sanu *(MBA HOD)* | `sanu@gmail.com` | provided separately | SNGCE - MBA |
| **Faculty** | Dr. Rajimol A *(BCA HOD)* | `rajimol@gmail.com` | provided separately | SCMS - BCA |
| **Student** | Alan Santu | `alan@gmail.com` *(or `student@sngce.edu`)* | provided separately | SNGCE - MCA Semester 3 |
| **Student** | Aveen Krishna | `aveen@gmail.com` | provided separately | SNGCE - MCA Semester 3 |
| **Student** | Muzammil P S | `muzammil@gmail.com` | provided separately | SNGCE - MCA Semester 2 |
| **Student** | Abhay Hari | `abhay@gmail.com` | provided separately | SNGCE - MBA Semester 1 |
| **Student** | Arjun Raj | `arjun@gmail.com` | provided separately | SCMS - BCA Semester 1 |
| **Recruiter**| Daniel Thomas | `recruiter@techcorp.com` | provided separately | Nexus Technologies |

> [!TIP]
> On the login page (`/login`), click the respective tab corresponding to your role (**Student**, **Faculty**, **Admin**, or **Company**) before clicking **Sign In**.

---

## Running Automated Tests

PeerX includes an automated integration test suite written with Node's native test runner and `supertest`. The suite verifies:
- Authentication & role-based route gating
- Institution code uniqueness constraints
- Administrator student/faculty provisioning & credential updates
- Strict faculty timetable allocation checks for attendance
- P2P skill course creation, 30+ question validations, and mid-term gating
- Candidate search filtering and explainable Match Score calculations
- Unlimited resume generation
- Live study room messaging and presence alerts

Run the test suite with:

```bash
npm test
```

Expected output:
```
✔ 1. Auth & Role Restriction: rejects login with role mismatch
✔ 2. Admin Institution Uniqueness: rejects duplicate universityCollegeId registration
✔ 3. Admin Provisioning: admin can provision student account with institution binding
✔ 4. Faculty Attendance Authorization: strictly verifies timetable allocation chain
✔ 5. Peer Skill Exchange, Sequential Modules, Evaluations & Tutor Feedback
✔ 6. Company Talent Discovery: filters public candidates and computes explainable Match Score
✔ 7. Resume Generator: allows unlimited generations without cooldown limit
✔ 8. Skill Course Creation & Mid-Term Gating: validates 30+ questions, dynamic modules/materials
✔ 9. Admin Student & Faculty CRUD with Email & Password Credential Updates
✔ 10. Admin Department Management: Edit Department and Change HOD
✔ 11. Faculty Advisor (FA) Role: HOD assignment, class-specific timetable scheduling
✔ 12. Peer Study Room Live Chat, Presence Alerts & Meeting Link Management

ℹ tests 12 | pass 12 | fail 0
```

---

## Production Build

To compile and preview the production build of the frontend client:

```bash
# 1. Build optimized static assets in client/dist
npm run build --prefix client

# 2. Preview the production client build locally
npm run preview --prefix client
```

To run the backend server in production mode:
```bash
NODE_ENV=production npm run start:server
```

---

## API Endpoints Overview

The API server provides the following RESTful route endpoints under `/api`:

| Base Endpoint | Description | Protected |
| :--- | :--- | :---: |
| `GET /api/health` | Server operational status & timestamp | No |
| `/api/auth` | Login, registration (Admin, Company), profile lookup | Partially |
| `/api/admin` | College departments, faculty/student CRUD, announcements, analytics | Admin |
| `/api/faculty` | Class sessions, timetable view, attendance logging, course materials | Faculty |
| `/api/students`| Enrolled subjects, attendance percentage, assignment submissions, marks | Student |
| `/api/skills` | Peer skill exchange courses, modules, quizzes, feedback, study rooms | Authenticated |
| `/api/resumes` | Resume data generation, portfolio PDF export formatting | Student |
| `/api/company` | Candidate discovery, shortlist management, opportunity postings | Company |
| `/api/communications` | Campus circulars, event calendars, grievance handling | Authenticated |
| `/api/ai` | Grounded context-aware campus assistant chat | Authenticated |
| `GET /uploads/*` | Static file server for uploaded documents, PDFs, slides, and videos | No |

---

## Troubleshooting & FAQs

### 1. Port 5001 is already in use (`EADDRINUSE`)
- **Reason**: On macOS Monterey and later, macOS AirPlay Receiver occupies port `5000` and sometimes `5001`.
- **PeerX Solution**: The server automatically detects port conflicts and retries on the next available port (`5002`, `5003`, etc.).
- **Manual Workaround**: You can turn off AirPlay Receiver in **System Settings > General > AirDrop & AirPlay > AirPlay Receiver (Off)**, or specify another port in `server/.env` (e.g. `PORT=5005`). Update `client/vite.config.js` proxy targets accordingly if changing the default backend port.

### 2. Can I run PeerX without installing MongoDB?
- **Yes!** PeerX has an automatic embedded database fallback (`mongodb-memory-server`). If an external MongoDB instance is not detected and `ENABLE_MEMORY_DB=true` in `server/.env`, PeerX spins up an in-memory database automatically and populates it with sample data.

### 3. Login returns "Role mismatch: This account is registered as '...'"
- Ensure you select the correct role tab on the Login page (`/login`) matching the account you are signing into (**Admin**, **Faculty**, **Student**, or **Company**).

### 4. File uploads are failing
- Verify that the `server/uploads` folder exists and has write permissions. The server automatically creates this directory on startup if it does not exist. Supported file extensions include: PDF, PPT, PPTX, DOC, DOCX, ZIP, Images (PNG, JPG, WEBP), and Videos (MP4, WebM, MOV, MKV) up to 100MB.

---

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
Developed as part of the MCA Final Year Project.

