import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/layout/Navbar';

import ChatGPTView from './pages/ChatGPTView';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import LearningLabPage from './pages/LearningLabPage';
import LeaderboardPage from './pages/LeaderboardPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AskQuestionPage from './pages/AskQuestionPage';

// Protected Route Guard
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 p-8 flex items-center justify-center">
        Loading CampusMind AI...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
            
            <Navbar />

            <main className="flex-1 flex flex-col">
              <Routes>
                {/* Main ChatGPT Realtime Interface as Home View */}
                <Route path="/" element={<ChatGPTView />} />
                <Route path="/forum" element={<HomePage />} />
                
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:resettoken" element={<ResetPasswordPage />} />
                
                <Route path="/questions/:id" element={<QuestionDetailPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />

                {/* Protected Student Routes */}
                <Route
                  path="/ask"
                  element={
                    <ProtectedRoute>
                      <AskQuestionPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/learning"
                  element={
                    <ProtectedRoute>
                      <LearningLabPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Only Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
