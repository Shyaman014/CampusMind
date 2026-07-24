import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import CampusMindIcon from '../components/ui/CampusMindIcon';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password, department, yearOfStudy, role });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-transparent">
      <div className="w-full max-w-lg p-8 rounded-2xl bg-[#111111] border border-[#2A2A2A] space-y-8 shadow-sm">
        
        <div className="text-center space-y-4 flex flex-col items-center">
          <CampusMindIcon size={40} />
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Join CampusMind AI</h2>
            <p className="text-sm text-[#A1A1AA] mt-1">Create your account to ask doubts and earn reputation</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-400/10 border border-red-400/20 text-[13px] text-red-400 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="text"
                required
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#3A3A3A] smooth-transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Campus Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="email"
                required
                placeholder="alex@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#3A3A3A] smooth-transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Password</label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 text-[14px] bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#3A3A3A] smooth-transition appearance-none"
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
              <label className="block text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Year of Study</label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-3 py-2.5 text-[14px] bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#3A3A3A] smooth-transition appearance-none"
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
            className="w-full py-2.5 rounded-xl text-[14px] font-medium bg-white text-[#0B0B0B] hover:bg-[#E4E4E7] smooth-transition flex items-center justify-center space-x-2 mt-4 disabled:opacity-50 disabled:hover:bg-white"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        <p className="text-center text-[13px] text-[#A1A1AA] pt-4 border-t border-[#2A2A2A]">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-medium hover:underline smooth-transition">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
