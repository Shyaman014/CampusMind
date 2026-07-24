# CampusMind AI 🎓🤖

An intelligent, premium academic assistant designed to help students learn, build, and succeed. CampusMind AI serves as a centralized hub for asking academic doubts, tracking learning streaks, uploading study materials, and earning reputation points—all wrapped in a sleek, modern, dark-themed UI.

---

## ✨ Features

- **Intelligent AI Chat**: Ask questions and get instant, detailed explanations formatted beautifully with Markdown and code highlighting.
- **Student Dashboard**: Track your learning progress, including doubts asked, answers provided, daily streaks, and reputation points.
- **Seamless Authentication**: Secure JWT-based authentication with distinct roles (Student & Admin) and automated demo accounts for quick testing.
- **Profile Customization**: Click-to-edit your profile name and seamlessly upload/update your avatar directly from the dashboard.
- **Context-Aware Learning**: Upload study materials and documents for the AI to understand your specific academic context.
- **Premium UI/UX**: A highly polished, completely custom static dark theme avoiding generic gradients, featuring fluid micro-animations and a custom geometric brand identity.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State Management**: React Context API
- **Rendering**: React Markdown, Rehype Highlight, Remark GFM

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Real-time**: Socket.io
- **AI Integration**: Gemini API (`@google/genai` or similar)
- **File Uploads**: Multer

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)
- AI API Key (e.g., Gemini / Groq / OpenAI)

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
# AI Keys
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

- **Student:** `student@campusmind.ai` / `Password123!`
- **Admin:** `admin@campusmind.ai` / `AdminPassword123!`

---

## 📁 Project Structure

```text
CampusMind-AI/
├── backend/
│   ├── config/          # DB connection & external service configs
│   ├── controllers/     # Route logic (Auth, Chat, Dashboard, etc.)
│   ├── middleware/      # JWT Protect, Rate Limiting, File Uploads
│   ├── models/          # Mongoose Schemas (User, Question, etc.)
│   ├── routes/          # Express route definitions
│   ├── services/        # AI Service integration (Gemini)
│   ├── utils/           # Database seeders, API Responders
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI (Chat, Layouts, Icons)
    │   ├── context/     # AuthContext for global state
    │   ├── pages/       # Login, Register, Dashboard, ChatGPTView
    │   ├── services/    # Axios API interceptors
    │   ├── index.css    # Tailwind entry & custom CSS variables
    │   └── main.jsx     # React entry point
    ├── index.html       # HTML Template
    └── vite.config.js   # Vite configuration
```

---

## 🎨 Design Philosophy

CampusMind AI rejects generic stock illustrations and noisy colorful gradients. Instead, it embraces a **premium, monochrome architectural design**:
- Deep `#0B0B0B` to `#171717` backgrounds.
- High-contrast crisp white typography.
- Meaningful micro-interactions and transitions.
- A custom geometric logo representing a continuous cycle of knowledge (the outer 'C') and the catalyst of intelligence (the inner 'Spark').

---

*Built with ❤️ for students, educators, and lifelong learners.*
