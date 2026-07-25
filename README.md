# CampusMind AI v2.0 🎓🤖

An intelligent, premium academic learning platform and coding assistant designed to help students learn, build, and succeed. Built on a clean MERN architecture, CampusMind AI serves as a centralized hub for interactive AI tutoring, multi-format document analysis, 4-tier study note synthesis, algorithm debugging, and gamified reputation tracking—all wrapped in a sleek, modern, dark-themed UI.

---

## ✨ Features & Capabilities

### 💬 1. Intelligent AI Chat & Assistant
- **Streaming AI Responses**: Real-time markdown rendering with LaTeX math formatting and syntax highlighting via Prism.
- **Prompt Editing & Regeneration**: Modify sent prompts on the fly or click **Regenerate** on any AI response.
- **Version Comparison**: Seamlessly navigate between regenerated answer drafts with inline `< 1 / 2 >` version history controls.
- **RLHF Analytics**: Inline helpful/unhelpful (`👍 / 👎`) feedback buttons wired directly to backend learning metrics.

### 💻 2. Specialized Coding Assistant Mode
- **Target Language Selector**: Instantly switch between `Python`, `JavaScript`, `TypeScript`, `Java`, `C++`, `C#`, `Go`, `Rust`, and `SQL`.
- **One-Click Algorithm Tools**:
  - 🔍 **Explain Code**: Step-by-step logic breakdown and execution flow.
  - 🐞 **Debug & Fix**: Automated detection and correction of syntax and logical bugs.
  - ⚡ **Optimize**: Refactoring for maximum performance and readability.
  - 📊 **Time Complexity**: Big-O time and space complexity derivation.
  - 🔄 **Code Converter**: Clean translation between programming languages.
- **Copy Tooltip**: Instant one-click clipboard copy (`Copied!`) on code blocks.

### 📚 3. 4-Tier AI Notes Synthesizer (Notes Lab)
Upload lecture slides, textbooks, or research papers and generate structured study packs across 4 specialized depths:
1. 📖 **Executive Summary**: High-level overview of core themes and concepts.
2. 📚 **Detailed Study Notes**: Comprehensive, structured academic breakdown.
3. ⚡ **Short Summary**: Quick takeaways for rapid review.
4. 🎯 **Exam Cram & Cheatsheet**: Likely test questions, definitions, formulas, and high-yield review bullets.
- **Interactive Tools**: Test your knowledge with auto-generated **Flashcard Decks** and **Practice Quizzes**.

### 📄 4. Multi-Format Document Analysis & OCR
- **Supported Formats**: Full parsing support for `.md`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.txt`, `.pdf`, and Images (`.png`, `.jpg`, `.jpeg`, `.webp`).
- **Drag & Drop Workspace**: Visual drag-and-drop overlay with multi-file attachment pills and upload progress indicators.
- **Fallback Vision OCR**: Integrated Tesseract.js pipeline for text extraction from scanned slides and image documents.

### 📤 5. Multi-Format Export & Sharing
Download your chat conversations and synthesized study notes in your preferred format:
- 📄 Export as **Markdown** (`.md`)
- 📝 Export as **Plain Text** (`.txt`)
- 📘 Export as **Microsoft Word compatible** (`.docx`)
- 🖨️ Save as **PDF / Print** (`.pdf`)

### 🏆 6. Student Dashboard & Avatar System
- **Gamified Progress**: Track learning streaks, questions asked, community answers provided, and reputation points.
- **Priority Avatar System**:
  1. 📷 **Custom Uploaded Photo**: Upload directly from your profile dashboard.
  2. 🌐 **Google OAuth Photo**: Displays your Google account avatar automatically upon social login.
  3. 🎨 **Initials Avatar Badge**: Sleek gradient initials badge generated automatically if no photo exists.

---

## 🎨 Brand Identity & Design Philosophy

CampusMind AI rejects generic stock illustrations and noisy colorful gradients. Instead, it embraces a **premium, monochrome architectural design**:
- **Deep Monochrome Palette**: High-contrast `#0B0B0B` to `#171717` dark backgrounds paired with crisp white typography.
- **Geometric Brand Emblem**: Our official logo features a smooth **Open Knowledge Loop** (an open circular ring representing continuous learning) paired with an upper-right **AI Spark Dot** (representing the catalytic node of artificial intelligence).
- **Fluid Micro-interactions**: Smooth hover elevations, subtle glowing accents, and zero horizontal overflow across Desktop, Tablet, and Mobile devices.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS & Vanilla CSS Design Variables
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State Management**: React Context API (`AuthContext`)
- **Rendering**: React Markdown, Remark GFM, Prism Syntax Highlighter

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose Schemas & Migrations)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs & Google OAuth (Passport.js)
- **AI Integration**: Google Gemini API (`@google/genai`)
- **File Uploads & Extraction**: Multer, pdf-parse, mammoth, Tesseract.js (OCR)

---

## 🚀 Getting Started

Follow these instructions to set up and run CampusMind AI locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- AI API Key (e.g., Google Gemini API Key)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CampusMind-AI.git
cd CampusMind-AI
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure your environment variables.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campusmind
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend development server:
```bash
npm run dev
# The server will automatically seed Demo Users on startup.
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, install dependencies, and start the Vite server.

```bash
cd frontend
npm install
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 🧪 Demo Accounts

The application automatically seeds two demo accounts into the database upon startup. You can instantly log in using the **Instant Demo Login** buttons on the Login Page, or manually via:

- **Student Account:** `student@campusmind.ai` / `Password123!`
- **Admin Account:** `admin@campusmind.ai` / `AdminPassword123!`

---

## 📁 Project Structure

```text
CampusMind-AI/
├── backend/
│   ├── config/          # DB connection & Passport OAuth configs
│   ├── controllers/     # Route logic (Auth, Chat, Learning, Dashboard)
│   ├── middleware/      # JWT Protect, Rate Limiting, Multer File Uploads
│   ├── models/          # Mongoose Schemas (User, Chat, Upload, Question)
│   ├── routes/          # Express API route definitions
│   ├── services/        # AI Service integration (Gemini 4-tier synthesis)
│   ├── utils/           # Multi-format Document Extractor & OCR utilities
│   └── server.js        # Server entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI (Sidebar, InputBar, BrandLogo, UserAvatar)
    │   ├── context/     # AuthContext for global authentication state
    │   ├── pages/       # Login, Register, Dashboard, ChatGPTView, LearningLabPage
    │   ├── services/    # Axios API client & token interceptors
    │   ├── index.css    # Tailwind entry & custom CSS variables
    │   └── main.jsx     # React DOM entry point
    ├── favicon.svg      # Geometric brand SVG favicon
    ├── index.html       # HTML Root Template
    └── vite.config.js   # Vite configuration
```

---

*Built with ❤️ for students, educators, and lifelong learners.*
