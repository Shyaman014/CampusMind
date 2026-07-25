import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import { Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import CampusMindIcon from '../components/ui/CampusMindIcon';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.58-5.17 3.58-8.97z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('campusmind_remember') === 'true');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [requireVerification, setRequireVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isVerifiedBanner = searchParams.get('verified') === 'true';

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/facebook`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLocked(false);
    setRequireVerification(false);
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      navigate('/');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 423) {
        setIsLocked(true);
      } else if (status === 403 || data?.requireVerification) {
        setRequireVerification(true);
      }
      setError(data?.message || 'Login failed. Please check credentials.');
    }
    setLoading(false);
  };

  const fillDemoStudent = async () => {
    setEmail('student@campusmind.ai');
    setPassword('Password123!');
    await performLogin('student@campusmind.ai', 'Password123!');
  };

  const fillDemoAdmin = async () => {
    setEmail('admin@campusmind.ai');
    setPassword('AdminPassword123!');
    await performLogin('admin@campusmind.ai', 'AdminPassword123!');
  };

  const performLogin = async (loginEmail, loginPassword) => {
    setError('');
    setIsLocked(false);
    setRequireVerification(false);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword, rememberMe);
      navigate('/');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 423) {
        setIsLocked(true);
      } else if (status === 403 || data?.requireVerification) {
        setRequireVerification(true);
      }
      setError(data?.message || 'Login failed. Please check credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-transparent selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#2A2A2A] space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Logo & Welcome Back */}
        <div className="text-center space-y-3 flex flex-col items-center relative z-10">
          <CampusMindIcon size={44} />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-sm text-[#A1A1AA] mt-1">Sign in to your CampusMind AI account</p>
          </div>
        </div>

        {isVerifiedBanner && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[13px] text-emerald-300 font-medium text-center flex items-center justify-center gap-2 relative z-10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Email verified successfully! You can now sign in.</span>
          </div>
        )}

        {isLocked && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[13px] text-amber-300 space-y-1 text-center relative z-10">
            <div className="flex items-center justify-center gap-1.5 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Account Locked for Security</span>
            </div>
            <p className="text-xs text-amber-200/80">Too many failed login attempts detected. Please wait 30 minutes before trying again or reset your password.</p>
          </div>
        )}

        {requireVerification && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-[13px] text-indigo-300 space-y-2 text-center relative z-10">
            <p className="font-medium text-white">Verification Required</p>
            <p className="text-xs text-indigo-200/80">Please check your inbox and verify your email address to activate your account.</p>
            <div>
              <Link to="/resend-verification" className="inline-block text-xs font-bold text-indigo-400 hover:underline">
                Resend Verification Link →
              </Link>
            </div>
          </div>
        )}

        {error && !isLocked && !requireVerification && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400 font-medium text-center relative z-10">
            {error}
          </div>
        )}

        {/* OAuth Social Buttons */}
        <div className="space-y-3 relative z-10">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl text-[14px] font-medium bg-[#1A1A1A] border border-[#2A2A2A] text-white hover:bg-[#222222] hover:border-[#3A3A3A] transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 flex items-center justify-center cursor-pointer group"
          >
            <GoogleIcon />
            <span className="group-hover:text-white transition-colors">Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            className="w-full py-3 px-4 rounded-xl text-[14px] font-medium bg-[#1A1A1A] border border-[#2A2A2A] text-white hover:bg-[#222222] hover:border-[#3A3A3A] transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 flex items-center justify-center cursor-pointer group"
          >
            <FacebookIcon />
            <span className="group-hover:text-white transition-colors">Continue with Facebook</span>
          </button>
        </div>

        {/* Visual Divider */}
        <div className="relative flex py-2 items-center z-10">
          <div className="flex-grow border-t border-[#2A2A2A]"></div>
          <span className="flex-shrink mx-4 text-[#71717A] text-[11px] font-semibold tracking-wider uppercase">OR</span>
          <div className="flex-grow border-t border-[#2A2A2A]"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="email"
                required
                placeholder="name@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#161616] border border-[#2A2A2A] rounded-xl text-white placeholder-[#71717A] focus:outline-none focus:border-[#52525B] focus:ring-1 focus:ring-[#52525B] transition-all duration-150"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-medium text-[#A1A1AA] hover:text-white transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A1A1AA]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-[14px] bg-[#161616] border border-[#2A2A2A] rounded-xl text-white placeholder-[#71717A] focus:outline-none focus:border-[#52525B] focus:ring-1 focus:ring-[#52525B] transition-all duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#A1A1AA] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#161616] border-[#2A2A2A] text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-[12px] text-[#A1A1AA] font-medium">Remember me for 30 days</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-[14px] font-semibold bg-white text-[#0B0B0B] hover:bg-[#E4E4E7] transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 flex items-center justify-center space-x-2 mt-2 disabled:opacity-50 disabled:hover:bg-white disabled:hover:translate-y-0"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Instant Demo Login Pills */}
        <div className="pt-4 border-t border-[#2A2A2A] space-y-3 relative z-10">
          <div className="flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instant Demo Login</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={fillDemoStudent}
              className="py-2.5 px-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#242424] hover:border-[#3A3A3A] transition-all duration-200 transform hover:-translate-y-0.5 text-[12px] text-white font-medium flex items-center justify-center"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="py-2.5 px-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#242424] hover:border-[#3A3A3A] transition-all duration-200 transform hover:-translate-y-0.5 text-[12px] text-white font-medium flex items-center justify-center"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {/* Register Now Link */}
        <p className="text-center text-[13px] text-[#A1A1AA] pt-2 relative z-10">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-semibold hover:underline transition-all">
            Register Now
          </Link>
        </p>

      </div>
    </div>
  );
}

