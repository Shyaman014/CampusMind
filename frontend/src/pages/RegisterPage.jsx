import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
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



export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-type.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ name, email, password, department, yearOfStudy, role });
      if (res?.data?.user && !res.data.user.isVerified && !res.data.user.emailVerified) {
        setNeedsVerification(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  if (needsVerification) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#111111] border border-[#2A2A2A] space-y-6 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Check Your Email</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              We have sent a verification email to <strong className="text-white">{email}</strong>. Please click the link inside to activate your account and access all AI study rooms.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              to="/login"
              className="inline-block w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20"
            >
              Proceed to Login
            </Link>
            <Link
              to="/resend-verification"
              className="inline-block text-xs font-semibold text-[#71717A] hover:text-white transition-colors"
            >
              Didn't receive the email? Resend Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-transparent selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#2A2A2A] space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Logo & Join Title */}
        <div className="text-center space-y-3 flex flex-col items-center relative z-10">
          <CampusMindIcon size={44} />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Join CampusMind AI</h2>
            <p className="text-sm text-[#A1A1AA] mt-1">Create your account to ask doubts and earn reputation</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400 font-medium text-center relative z-10">
            {error}
          </div>
        )}

        {/* Email & Password Registration Form */}
        <form onSubmit={handleSubmit} method="POST" action="#" className="space-y-4 relative z-10">
          
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-[#A1A1AA]" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#161616] border border-[#2A2A2A] rounded-xl text-white placeholder-[#71717A] focus:outline-none focus:border-[#52525B] focus:ring-1 focus:ring-[#52525B] transition-all duration-150"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A1A1AA]" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="alex@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#161616] border border-[#2A2A2A] rounded-xl text-white placeholder-[#71717A] focus:outline-none focus:border-[#52525B] focus:ring-1 focus:ring-[#52525B] transition-all duration-150"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A1A1AA]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A1A1AA]" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-[14px] bg-[#161616] border border-[#2A2A2A] rounded-xl text-white placeholder-[#71717A] focus:outline-none focus:border-[#52525B] focus:ring-1 focus:ring-[#52525B] transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-[#A1A1AA] hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="department" className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Department</label>
              <select
                id="department"
                name="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] bg-[#161616] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#52525B] transition-all duration-150 appearance-none"
              >
                <option>Computer Science & Engineering</option>
                <option>Electronics & Communication</option>
                <option>Electrical Engineering</option>
                <option>Mechanical Engineering</option>
                <option>Information Technology</option>
                <option>Data Science & AI</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="yearOfStudy" className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Year of Study</label>
              <select
                id="yearOfStudy"
                name="yearOfStudy"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] bg-[#161616] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#52525B] transition-all duration-150 appearance-none"
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year / Senior</option>
                <option>Postgraduate / Alumni</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-[14px] font-semibold bg-white text-[#0B0B0B] hover:bg-[#E4E4E7] transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 flex items-center justify-center space-x-2 mt-4 disabled:opacity-50 disabled:hover:bg-white disabled:hover:translate-y-0"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Visual Divider */}
        <div className="relative flex py-2 items-center z-10">
          <div className="flex-grow border-t border-[#2A2A2A]"></div>
          <span className="flex-shrink mx-4 text-[#71717A] text-[11px] font-semibold tracking-wider uppercase">OR</span>
          <div className="flex-grow border-t border-[#2A2A2A]"></div>
        </div>

        {/* Secondary Action: OAuth Google Button */}
        <div className="relative z-10">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl text-[14px] font-medium bg-[#1A1A1A] border border-[#2A2A2A] text-white hover:bg-[#222222] hover:border-[#3A3A3A] transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 flex items-center justify-center cursor-pointer group"
          >
            <GoogleIcon />
            <span className="group-hover:text-white transition-colors">Continue with Google</span>
          </button>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-[13px] text-[#A1A1AA] pt-3 border-t border-[#2A2A2A] relative z-10">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-semibold hover:underline transition-all">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
