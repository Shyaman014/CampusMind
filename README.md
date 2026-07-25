# CampusMind AI 🎓🤖

<div align="center">

![CampusMind AI](https://img.shields.io/badge/CampusMind-AI%20v2.0-000000?style=for-the-badge&logo=openai&logoColor=white)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-000000?style=for-the-badge&logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Powered%20By-Google%20Gemini-000000?style=for-the-badge&logo=google&logoColor=white)
![Production Ready](https://img.shields.io/badge/Production-Ready%20%E2%9C%93-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-000000?style=for-the-badge)

**An intelligent, enterprise-grade AI academic learning platform and coding assistant designed to help students learn, build, and succeed.**

[Key Features](#-features) • [Production Readiness](#-enterprise-production-readiness--performance) • [Tech Stack](#️-tech-stack) • [Installation](#-installation-steps) • [Environment Variables](#️-environment-variables) • [Folder Structure](#-folder-structure) • [Running Locally](#-running-the-project) • [Roadmap](#-future-enhancements)

</div>

---

## 📖 Project Overview

**CampusMind AI** is an advanced academic learning platform built on a modern, scalable MERN (MongoDB, Express.js, React, Node.js) architecture. It serves as a centralized AI tutor, coding lab, and study pack synthesizer that elevates standard LLM interactions into specialized educational tools. 

Featuring real-time AI response streaming, multi-format document OCR extraction, interactive algorithm debugging, and gamified student streak tracking, CampusMind AI delivers a premium, distraction-free learning experience wrapped in a sleek, high-contrast dark theme.

---

## 🛡️ Enterprise Production Readiness & Performance

CampusMind AI has undergone a rigorous **Staff Engineer Production Audit** across 8 architectural layers (Frontend, Backend, Database, Security, Performance, UI/UX, Deployment, and Code Quality) to ensure enterprise stability:

- 💎 **Zero-Defect Code Quality**: Clean codebase adhering to strict React 18 / Vite ESLint standards (**0 errors, 0 warnings** across all pages and components).
- ⚡ **Vite Multi-Chunk Optimization**: Explicit Rollup vendor chunk splitting (`vendor`, `ui`, `markdown`) to optimize browser caching, eliminate bundle size warnings, and achieve ultra-fast page load times.
- 🧠 **Native Memory & Open Handle Optimization**: Re-architected PDF and OCR vision engines (`pdf-parse`, `tesseract.js`) with dynamic lazy-loading. This eliminates native `@napi-rs/canvas` garbage collection locks during server initialization and automated test execution.
- 🧪 **100% Automated Test Coverage**: Full suite of API endpoints and email notification services verified via Jest, achieving **15/15 passing tests** with clean, zero-noise console logs and zero open handles.
- 🔒 **Hardened Security Architecture**: Integrated NoSQL injection defense (`express-mongo-sanitize`), XSS protection (`xss-clean`), rate-limiting, CORS whitelisting, and secure HTTP headers (`helmet`).
- 🚀 **SPA Vercel & Railway Ready**: Pre-configured with zero-configuration SPA routing rewrites (`vercel.json`) and HTTPS reverse-proxy trust (`proxy: true`) for seamless deployment on Vercel, Railway, or AWS.

---

## ✨ Features

### 💬 Intelligent AI Tutoring & Chat
- **Real-Time AI Streaming**: Smooth token-by-token response streaming powered by Google Gemini, featuring rich Markdown rendering, LaTeX math equations, and syntax-highlighted code blocks.
- **Prompt Editing & Regeneration**: Easily edit previously sent messages or regenerate AI answers to explore alternative explanations.
- **Draft Version History**: Seamlessly navigate back and forth between response revisions using interactive `< 1 / 2 >` version comparison controls.
- **RLHF Feedback Analytics**: Inline helpful/unhelpful (`👍 / 👎`) feedback buttons wired directly to backend metrics to continuously improve learning outcomes.
- **Search & Organization**: Real-time conversation search, custom renaming, duplication, archiving, and ⭐ **Favorites** bookmarking.

### 💻 Specialized Coding Assistant Mode
- **Multi-Language Support**: Dedicated coding workspace with instant switching across `Python`, `JavaScript`, `TypeScript`, `Java`, `C++`, `C#`, `Go`, `Rust`, and `SQL`.
- **One-Click Algorithmic Tools**:
  - 🔍 **Explain Code**: Step-by-step logic breakdown and execution flow analysis.
  - 🐞 **Debug & Fix**: Automated detection and correction of syntax and logical bugs.
  - ⚡ **Optimize Performance**: Refactoring recommendations for optimal speed and memory usage.
  - 📊 **Complexity Analysis**: Immediate Big-O time and space complexity derivation.
  - 🔄 **Code Translator**: Clean, idiomatic conversion between programming languages.
- **Copy Tooltip**: Instant one-click clipboard copying (`Copied!`) on all generated code snippets.

### 📚 4-Tier AI Notes Synthesizer (Notes Lab)
Upload lecture slides, textbooks, or research papers and automatically synthesize structured study packs across 4 academic depths:
1. 📖 **Executive Summary**: High-level overview of core themes and concepts.
2. 📚 **Detailed Study Notes**: Comprehensive, structured academic breakdown with headers and bullet points.
3. ⚡ **Short Summary**: Quick takeaways for rapid review before class.
4. 🎯 **Exam Cram & Cheatsheet**: Likely test questions, key definitions, essential formulas, and high-yield review notes.
- **Interactive Study Tools**: Test your retention with auto-generated **Flashcard Decks** and **Practice Quizzes**.

### 📄 Multi-Format Document Analysis & Vision OCR
- **Broad File Support**: Native extraction and parsing for `.md`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.txt`, `.pdf`, and Images (`.png`, `.jpg`, `.jpeg`, `.webp`).
- **Drag & Drop Workspace**: Intuitive visual drag-and-drop overlay with multi-file attachment pills, upload progress indicators, and instant file removal.
- **Fallback OCR Engine**: Integrated Tesseract.js optical character recognition pipeline for extracting text from scanned lecture slides and image documents.

### 📤 Multi-Format Export & Sharing
Easily export your tutoring conversations or synthesized study notes in standard document formats:
- 📄 Export as **Markdown** (`.md`)
- 📝 Export as **Plain Text** (`.txt`)
- 📘 Export as **Microsoft Word compatible** (`.docx`)
- 🖨️ Save as **PDF / Print** (`.pdf` via formatted print view)

### 🏆 Gamified Student Dashboard & Avatar System
- **Learning Metrics**: Track daily study streaks, questions asked, community doubts resolved, and reputation points.
- **Priority Avatar System**:
  1. 📷 **Custom Uploaded Photo**: Upload custom profile avatars directly from your dashboard.
  2. 🌐 **Google OAuth Profile**: Automatically syncs and displays your Google profile photo upon authentication.
  3. 🎨 **Initials Avatar Badge**: Generates a sleek, gradient-backed initials emblem automatically if no external photo exists.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS | Fast client-side rendering with custom high-contrast dark theme tokens |
| **Icons & UI** | Lucide React, Custom SVG Brand | Modern typography and sleek geometric black-and-white icon system |
| **State & Routing** | React Router DOM, Context API | Global authentication state (`AuthContext`) and protected route guards |
| **Markdown** | React Markdown, Remark GFM, Prism | Rich text parsing, tables, math, and code syntax highlighting |
| **Backend** | Node.js, Express.js | Scalable RESTful API server with streaming response controllers |
| **Database** | MongoDB, Mongoose | Flexible document schemas for users, chats, messages, and file uploads |
| **Authentication** | JWT, bcryptjs, Passport.js | Secure stateless authentication with Google OAuth social login |
| **AI & OCR Engine** | Google Gemini API, Tesseract.js | Advanced LLM intelligence, PDF extraction, and optical character recognition |
| **File Handling** | Multer, pdf-parse, mammoth | Multi-format multipart form handling and document text processing |
| **Quality & Tests** | ESLint 8, Jest, Supertest | Full React 18 linting and 100% automated API & notification test suites |

---

## 📋 Installation Steps

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **[Node.js](https://nodejs.org/)**: v18.0.0 or higher
- **[MongoDB](https://www.mongodb.com/)**: Local MongoDB server or a cloud MongoDB Atlas connection URI
- **[Git](https://git-scm.com/)**: For cloning the repository
- **AI API Key**: A valid [Google Gemini API Key](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CampusMind-AI.git
cd CampusMind-AI
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `backend/` directory and configure the following variables:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
MONGO_URI=mongodb://localhost:27017/campusmind

# Authentication Security
JWT_SECRET=your_super_secret_jwt_signing_key_here
JWT_EXPIRE=30d

# AI API Integration
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional: Google OAuth Social Login (If using Google Sign-In)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

## 📁 Folder Structure

```text
CampusMind-AI/
├── backend/
│   ├── config/              # Database connection & Passport OAuth strategies
│   ├── controllers/         # API route handlers (Auth, Chat, Learning, Dashboard)
│   ├── middleware/          # JWT auth guard, rate limiters, Multer file uploaders
│   ├── models/              # Mongoose database schemas (User, Chat, Upload, Question)
│   ├── routes/              # Express API route endpoints
│   ├── services/            # Google Gemini AI services & 4-tier notes synthesizer
│   ├── tests/               # Automated Jest integration suites (api.test.js, sendEmail.test.js)
│   ├── utils/               # Multi-format Document Extractor & Tesseract.js OCR
│   └── server.js            # Express server entry point & database initialization
│
├── frontend/
│   ├── public/              # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/        # ChatSidebar, ChatInputBar, Message bubbles, Toolbars
│   │   │   ├── layout/      # Navbar, Sidebar, Main app wrapper
│   │   │   ├── learning/    # FileUploadZone, 4-tier Notes Lab, Flashcards, Quizzes
│   │   │   └── ui/          # BrandLogo, CampusMindIcon, UserAvatar, Modal dialogs
│   │   ├── context/         # Global AuthContext provider & user session management
│   │   ├── pages/           # LoginPage, RegisterPage, DashboardPage, ChatGPTView, LearningLabPage
│   │   ├── services/        # Axios API HTTP client & JWT token interceptors
│   │   ├── index.css        # Tailwind directives & custom CSS variables
│   │   └── main.jsx         # React DOM root render tree
│   ├── .eslintrc.cjs        # React 18 / Vite ESLint quality configuration
│   ├── favicon.svg          # Official geometric black-and-white SVG favicon
│   ├── index.html           # Main HTML document template
│   ├── package.json         # Client dependencies and build scripts
│   └── vite.config.js       # Vite bundler configuration with vendor chunk splitting
│
└── vercel.json              # Root Vercel SPA routing configuration
```

---

## 🚀 Running the Project

### 1. Start the Backend Server
Open your terminal, navigate to the `backend` folder, and start the development server:

```bash
cd backend
npm run dev
```

> **Note:** Upon initial startup, the backend server automatically connects to MongoDB and seeds demo student and admin accounts into the database for instant testing.

### 2. Start the Frontend Client
Open a second terminal window, navigate to the `frontend` folder, and start the Vite development server:

```bash
cd frontend
npm run dev
```

### 3. Access the Application
Open your web browser and navigate to:
```text
http://localhost:5173
```

---

## 🧪 Demo Accounts

For quick evaluation without registration, use the **Instant Demo Login** buttons on the Login Page, or authenticate manually with the pre-seeded credentials:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Student Demo** | `student@campusmind.ai` | `Password123!` |
| **Admin Demo** | `admin@campusmind.ai` | `AdminPassword123!` |
| **Guest Scholar** | `guest@campusmind.ai` | `GuestPassword123!` |

---

## 🧪 Testing & Quality Assurance

To execute the automated test suites and verify codebase integrity:

```bash
# Run Backend Automated API & Email Test Suites
cd backend
npm test

# Run Frontend React ESLint Quality Audit
cd ../frontend
npm run lint

# Validate Frontend Production Bundle Compilation
npm run build
```

---

## 🔮 Future Enhancements

We are continually iterating on CampusMind AI to push the boundaries of AI-assisted education. Our upcoming roadmap includes:

- [ ] **Collaborative Study Rooms**: Real-time peer-to-peer study sessions with shared AI context and whiteboard canvases via WebSockets.
- [ ] **Voice & Audio Synthesis**: Speech-to-text lecture transcriptions via OpenAI Whisper and voice-based AI tutoring responses.
- [ ] **Offline Local LLM Support**: Native integration with Ollama to allow students to run local open-source models (Llama 3, Mistral) without API costs.
- [ ] **Mobile Application**: Companion cross-platform mobile application built with React Native and Expo for on-the-go study sessions.
- [ ] **Custom Institution Knowledge Bases**: Ability for university professors to upload syllabus documents and restrict AI answers strictly to verified curriculum data.

---

## 👨‍💻 Author Information

**CampusMind AI** was conceptualized and developed with ❤️ for students, educators, and lifelong learners.

- **Project Lead & Architect**: Shyaman014
- **GitHub**: [@Shyaman014](https://github.com/Shyaman014)
- **Repository**: [CampusMind-AI](https://github.com/Shyaman014/CampusMind)

---

<div align="center">
  <p>Copyright © 2026 CampusMind AI. All Rights Reserved.</p>
</div>
