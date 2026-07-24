import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import CampusMindIcon from '../components/ui/CampusMindIcon';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
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
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-transparent">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#111111] border border-[#2A2A2A] space-y-8 shadow-sm">
        
        <div className="text-center space-y-4 flex flex-col items-center">
          <CampusMindIcon size={40} />
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Welcome Back</h2>
            <p className="text-sm text-[#A1A1AA] mt-1">Sign in to your CampusMind AI account</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-[13px] text-red-400 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="email"
                required
                placeholder="student@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#3A3A3A] smooth-transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-medium text-[#A1A1AA] hover:text-white smooth-transition">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#3A3A3A] smooth-transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-[14px] font-medium bg-white text-[#0B0B0B] hover:bg-[#E4E4E7] smooth-transition flex items-center justify-center space-x-2 mt-2 disabled:opacity-50 disabled:hover:bg-white"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <div className="pt-6 border-t border-[#2A2A2A] space-y-3">
          <p className="text-[10px] text-[#A1A1AA] text-center font-medium uppercase tracking-wider">Instant Demo Login</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={fillDemoStudent}
              className="py-2 px-3 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] hover:bg-[#242424] text-[12px] text-white font-medium smooth-transition"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="py-2 px-3 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] hover:bg-[#242424] text-[12px] text-white font-medium smooth-transition"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <p className="text-center text-[13px] text-[#A1A1AA]">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-medium hover:underline smooth-transition">
            Register now
          </Link>
        </p>

      </div>
    </div>
  );
}
