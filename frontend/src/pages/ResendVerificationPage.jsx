import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ResendVerificationPage() {
  const { resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await resendVerificationEmail(email);
      if (res && res.success) {
        setSubmitted(true);
        setSuccessMsg(res.message || 'Verification email sent successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification link. Please check the email.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-indigo-500/30 space-y-6 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/20 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-2">
            <RefreshCw className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Resend Verification</h2>
          <p className="text-xs text-slate-400">Enter your campus email to receive a new activation link</p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Email Dispatched</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We have sent a fresh verification link to <span className="font-bold text-indigo-300">{email}</span>. Please check your inbox and spam folder.
            </p>
            <div className="pt-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} method="POST" action="#" className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-rose-500/10 text-rose-300 text-xs font-semibold text-center">{error}</div>}
            {successMsg && <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-300 text-xs font-semibold text-center">{successMsg}</div>}
            
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="student@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Send Verification Link
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
