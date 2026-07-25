import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { CheckCircle2, XCircle, Loader2, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await API.get(`/auth/verifyemail/${token}`);
        if (res.data.success) {
          setStatus('success');
          setMessage(res.data.message || 'Your email has been verified successfully!');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
      }
    };
    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-indigo-500/30 space-y-6 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/20 shadow-2xl text-center">
        
        <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Email Verification</h2>

        {status === 'verifying' && (
          <div className="py-8 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-300 font-medium">Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Verification Successful!</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                to="/login?verified=true"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all shadow-lg shadow-emerald-500/20"
              >
                Continue to Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-4">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Verification Failed</h4>
            <p className="text-xs text-rose-200 leading-relaxed">{message}</p>
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                to="/resend-verification"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                Resend Verification Email
              </Link>
              <Link
                to="/login"
                className="inline-block text-xs font-bold text-slate-400 hover:text-white transition-colors py-1"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
